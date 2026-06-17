create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.profiles
  add column if not exists elo_bullet integer not null default 1200,
  add column if not exists elo_blitz integer not null default 1200,
  add column if not exists elo_rapid integer not null default 1200;

create table if not exists public.ranked_game_results (
  room_id text primary key,
  category text not null check (category in ('bullet', 'blitz', 'rapid')),
  white_player_id uuid not null references public.profiles(id) on delete cascade,
  black_player_id uuid not null references public.profiles(id) on delete cascade,
  white_score numeric not null check (white_score in (0, 0.5, 1)),
  created_at timestamptz not null default now()
);

create or replace function public.submit_ranked_game_result(
  p_room_id text,
  p_category text,
  p_white_player_id uuid,
  p_black_player_id uuid,
  p_white_score numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user uuid := auth.uid();
  v_white_elo integer;
  v_black_elo integer;
  v_expected_white numeric;
  v_expected_black numeric;
  v_new_white integer;
  v_new_black integer;
  v_k integer := 32;
  v_column_name text;
begin
  if v_auth_user is null then
    raise exception 'not_authenticated';
  end if;

  if v_auth_user not in (p_white_player_id, p_black_player_id) then
    raise exception 'not_a_player';
  end if;

  if p_white_player_id = p_black_player_id then
    raise exception 'same_player';
  end if;

  if p_category not in ('bullet', 'blitz', 'rapid') then
    raise exception 'invalid_category';
  end if;

  if p_white_score not in (0, 0.5, 1) then
    raise exception 'invalid_score';
  end if;

  insert into public.profiles (id)
  values (p_white_player_id), (p_black_player_id)
  on conflict (id) do nothing;

  insert into public.ranked_game_results (
    room_id,
    category,
    white_player_id,
    black_player_id,
    white_score
  )
  values (
    p_room_id,
    p_category,
    p_white_player_id,
    p_black_player_id,
    p_white_score
  )
  on conflict (room_id) do nothing;

  if not found then
    return;
  end if;

  v_column_name := case p_category
    when 'bullet' then 'elo_bullet'
    when 'blitz' then 'elo_blitz'
    else 'elo_rapid'
  end;

  execute format('select %I from public.profiles where id = $1', v_column_name)
    into v_white_elo
    using p_white_player_id;

  execute format('select %I from public.profiles where id = $1', v_column_name)
    into v_black_elo
    using p_black_player_id;

  v_white_elo := coalesce(v_white_elo, 1200);
  v_black_elo := coalesce(v_black_elo, 1200);
  v_expected_white := 1 / (1 + power(10, (v_black_elo - v_white_elo)::numeric / 400));
  v_expected_black := 1 - v_expected_white;
  v_new_white := round(v_white_elo + v_k * (p_white_score - v_expected_white));
  v_new_black := round(v_black_elo + v_k * ((1 - p_white_score) - v_expected_black));

  execute format('update public.profiles set %I = $1 where id = $2', v_column_name)
    using v_new_white, p_white_player_id;

  execute format('update public.profiles set %I = $1 where id = $2', v_column_name)
    using v_new_black, p_black_player_id;
end;
$$;

grant execute on function public.submit_ranked_game_result(text, text, uuid, uuid, numeric)
  to authenticated;
