# Dossier d'Architecture Technique

## Projet : Application de Jeu d'Échecs Cross-Platform (Web & Mobile)

## 1. Contexte et Objectifs

Ce document définit l'architecture logicielle pour le développement d'une application d'échecs professionnelle dans un contexte académique à contrainte de temps forte.

**Objectif principal :** Délivrer une application performante, sécurisée et maintenable (Web/iOS/Android) en minimisant la gestion d'infrastructure serveur.
**Stratégie :** Architecture **Serverless / BaaS (Backend-as-a-Service)** orientée événements.

> **Définition :** Le **Backend-as-a-Service (BaaS)** est un modèle de cloud computing où le développeur externalise tous les aspects "arrière-plan" d'une application (base de données, authentification, notifications, stockage) à un fournisseur tiers via des APIs. Cela permet de se concentrer sur le code frontend sans gérer ni maintenir de serveurs physiques ou virtuels.

## 2. Stack Technologique (Choix & Justifications)

Le choix de la stack privilégie l'homogénéité du langage (**TypeScript**) et l'utilisation de services gérés pour accélérer le développement.

### 2.1 Frontend (Application Client)

- **Framework :** **React Native avec Expo (SDK 50+)**.
  - _Justification :_ Codebase unique pour Web, iOS et Android. Itération rapide avec Expo Go.

- **Langage :** **TypeScript**.
  - _Justification :_ Sécurité du typage indispensable pour la logique complexe des règles d'échecs.

- **Routage :** **Expo Router (File-based routing)**.
  - _Justification :_ Gestion native des URLs profondes (Deep Linking), critique pour le partage de liens de parties (`myapp.com/game/123`).

- **Gestion d'État :** **Zustand**.
  - _Justification :_ Plus léger et moins verbeux que Redux, idéal pour gérer l'état asynchrone (Session, WebSocket, Jeu).

- **Bibliothèque UI :** **Tamagui**.
  - _Justification :_ Solution "Universal App" par excellence. Tamagui offre des performances natives supérieures (compilateur optimisant) et un rendu Web impeccable (CSS pur). Idéal pour un design responsive et cohérent entre les plateformes sans sacrifier la performance.

### 2.2 Moteur de Jeu & Interface

- **Logique Métier :** **Chess.js**.
  - _Justification :_ Standard industriel pour la validation des coups, la détection de Mat/Pat/Nul et la génération FEN/PGN.

- **Composant UI (Plateau) :** **`react-native-chessboard`**.
  - _Justification :_ Composant performant gérant les gestes (Drag & Drop) sur mobile et la souris sur Web via SVG.

- **Intelligence Artificielle :** **Stockfish.js (WASM)**.
  - _Justification :_ Exécution de l'IA côté client (WebAssembly). Permet le jeu hors-ligne et économise les ressources serveur.

### 2.3 Backend & Infrastructure

- **BaaS :** **Supabase**.
  - _Justification :_ Offre Auth, Base de données, API et Temps réel en un seul service.

- **Base de Données :** **PostgreSQL**.
  - _Justification :_ Relationnel, robuste, supporte les transactions complexes et le JSONB.

- **Temps Réel :** **Supabase Realtime**.
  - _Justification :_ Remplace Socket.io. Permet la synchronisation des coups et du chat via WebSockets sur abonnement aux tables.

## 3. Architecture Fonctionnelle

### 3.1 Connexion aux Parties & Rôles (Logique URL)

L'accès à une partie se fait via une URL unique ou un ID : `/game/[id]`. Le système détermine dynamiquement le rôle de l'utilisateur.

1. **Vérification :** À l'ouverture, le client interroge la table `games`.

2. **Attribution du Rôle :**
   - **JOUEUR (Reprise) :** Si `user.id` == `white_player_id` OU `black_player_id`.

   - **JOUEUR (Join) :** Si la place noire est libre (`NULL`) ET `status` == `'waiting'` ET `visibility` permet l'accès.

   - **SPECTATEUR :** Si les deux places sont prises et que l'utilisateur n'est pas un des joueurs.

3. **Conséquence UI :**
   - _Joueur :_ Plateau interactif, Drag & Drop activé à son tour.

   - _Spectateur :_ Plateau verrouillé, vue orientée selon les Blancs (ou paramétrable).

### 3.2 Matchmaking "Join or Create"

Pour jouer contre un inconnu, nous utilisons une logique transactionnelle sur la DB (via une fonction RPC PostgreSQL pour éviter les conflits).

- **Algorithme :**
  1. Chercher une partie avec `status='waiting'`, `visibility='public'` et `black_player_id=NULL`.

  2. **Si trouvée :** UPDATE la partie avec mon ID -> La partie commence.

  3. **Si non trouvée :** INSERT une nouvelle partie (`visibility='public'`, `status='waiting'`) -> J'attends.

### 3.3 Système Social & Chat

- **Liste d'Amis & Présence :** Utilisation de Supabase Presence pour voir qui est "En ligne" ou "En jeu".

- **Invitations :**
  - L'invitation crée une partie privée (`visibility='private'`) pré-remplie avec l'ID de l'ami.

  - Une notification Realtime (Channel utilisateur) déclenche une pop-up chez l'ami.

- **Chat Unifié :**
  - Une seule interface de chat, mais contextuelle.

  - Si je suis dans `/game/[id]`, j'écris dans le channel `game:[id]`.

  - Si je suis sur le profil d'un ami, j'écris dans le channel `friend:[friendship_id]`.

## 4. Modélisation des Données (Schéma BDD)

### 4.1 Table `profiles` (Utilisateurs)

Extension publique de la table d'authentification.

| Colonne      | Type      | Description               |
| :----------- | :-------- | :------------------------ |
| `id`         | UUID (PK) | Lien vers `auth.users`    |
| `username`   | Text      | Unique, affichage public  |
| `elo`        | Integer   | Score (Défaut 1200)       |
| `wins`       | Integer   | Compteur victoires (Auto) |
| `losses`     | Integer   | Compteur défaites (Auto)  |
| `draws`      | Integer   | Compteur nuls (Auto)      |
| `avatar_url` | Text      | Lien image                |

### 4.2 Table `games` (Parties)

| Colonne           | Type      | Description                                         |
| :---------------- | :-------- | :-------------------------------------------------- |
| `id`              | UUID (PK) | Identifiant partie                                  |
| `white_player_id` | UUID (FK) | Joueur Blancs                                       |
| `black_player_id` | UUID (FK) | Joueur Noirs (Nullable si en attente)               |
| `fen`             | Text      | État du plateau (FEN string)                        |
| `pgn`             | Text      | Historique des coups                                |
| `status`          | Enum      | `waiting`, `playing`, `finished`, `aborted`         |
| `winner_id`       | UUID (FK) | ID du gagnant (Null si nul ou en cours)             |
| `visibility`      | Enum      | `public` (Matchmaking), `private` (Invitation/Lien) |
| `time_control`    | JSONB     | Ex: `{"limit": 600, "increment": 0}`                |
| `last_move_at`    | Timestamp | Pour calculer le temps écoulé                       |

### 4.3 Table `friendships` (Relations)

| Colonne        | Type      | Description                      |
| :------------- | :-------- | :------------------------------- |
| `requester_id` | UUID (FK) | Demandeur                        |
| `receiver_id`  | UUID (FK) | Destinataire                     |
| `status`       | Enum      | `pending`, `accepted`, `blocked` |

### 4.4 Table `messages` (Chat)

| Colonne         | Type      | Description                     |
| :-------------- | :-------- | :------------------------------ |
| `id`            | UUID      | PK                              |
| `game_id`       | UUID      | FK (Nullable) -> Chat de partie |
| `friendship_id` | UUID      | FK (Nullable) -> Chat privé     |
| `sender_id`     | UUID      | Auteur                          |
| `content`       | Text      | Message                         |
| `created_at`    | Timestamp | Ordre d'affichage               |

## 5. Automatisation et Sécurité (Backend)

### 5.1 Trigger de Statistiques ("Fire and Forget")

Pour garantir l'intégrité des données, le client ne met jamais à jour les compteurs `wins/losses`.

- **Mécanisme :** Trigger PostgreSQL `on_game_finish`.

- **Logique :** Quand `games.status` passe à `finished` :
  - Incrémenter `games_played` pour les deux.

  - Si `winner_id` existe : `+1 wins` pour lui, `+1 losses` pour l'autre.

  - Sinon : `+1 draws` pour les deux.

### 5.2 Sécurité (RLS - Row Level Security)

Les règles d'accès sont définies dans la base de données :

1. **Modification d'une partie :** Autorisé UNIQUEMENT si :
   - `auth.uid()` est l'un des participants.

   - C'est le tour de sa couleur (déduit du FEN).

   - La partie n'est pas finie.

2. **Chat :** Autorisé uniquement si participant à la partie ou membre de l'amitié.

## 6. Organisation du Projet (Structure Dossiers)

Pour faciliter le travail en équipe et la séparation des concepts.
