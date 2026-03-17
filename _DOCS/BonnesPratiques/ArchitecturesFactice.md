app/                    # Routing Expo Router
  (auth)/               # Pages publiques (login, signup)
    login.tsx
    signup.tsx
    _layout.tsx

  (protected)/          # Pages nécessitant authentification
    home.tsx
    profile.tsx
    _layout.tsx

  _layout.tsx           # Layout global
  index.tsx             # Entry point

components/             # Composants UI réutilisables
  ui/                   # Design system (Tamagui)
    Button.tsx
    Text.tsx
    Card.tsx

  common/               # Composants génériques
    Loader.tsx
    ErrorMessage.tsx

features/               # Logique par feature (domain-driven)
  auth/
    hooks/
      useAuth.ts
    components/
      LoginForm.tsx
    services/
      auth.service.ts

  user/
    hooks/
      useUser.ts
    components/
      UserCard.tsx
    services/
      user.service.ts

lib/                    # Config & clients externes
  supabase.ts           # Client Supabase
  tamagui.config.ts     # Config Tamagui

services/               # Services globaux (optionnel)
  api/
    client.ts           # Wrapper API / fetch
  storage/
    secureStore.ts      # Gestion SecureStore

repositories/           # Abstraction data (optionnel avancé)
  user.repository.ts

hooks/                  # Hooks globaux réutilisables
  useTheme.ts
  useDebounce.ts

contexts/               # Contexts globaux
  AuthProvider.tsx
  ThemeProvider.tsx

constants/              # Constantes globales
  theme.ts
  config.ts

utils/                  # Fonctions utilitaires
  formatDate.ts
  validateEmail.ts

types/                  # Types TypeScript
  user.ts
  auth.ts

__tests__/              # Tests
  auth/
  user/

assets/                 # Images, fonts, etc.