# Chess.fr — Application d'échecs (projet étudiant)

https://chess-qrqagjgey-lucasmarrots-projects.vercel.app/

**Résumé :**
Chess.fr est une application mobile multiplateforme développée avec Expo et React Native qui permet de jouer aux échecs, configurer des parties locales, gérer un profil joueur et interagir avec d'autres joueurs. Le projet sert de réalisation pour la première année d'ingénieur au CNAM.

**Contexte pédagogique :**

- **Type de projet :** Projet étudiant (1re année, cycle d'ingénieur) au CNAM.
- **Objectif pédagogique :** Appliquer des concepts de développement mobile cross-platform, gestion d'état, architecture d'application, et intégration backend (Supabase) dans un projet concret.

**Fonctionnalités principales :**

- **Parties locales :** configurer et jouer des parties en local.
- **Interface d'échiquier :** affichage et interactions gérées par le composant d'échiquier (`components/chess/ChessBoard.tsx`).
- **Gestion de profil :** pages et avatar utilisateur (dossier `profile`).
- **Fonctionnalités sociales :** recherche de joueurs et gestion d'amis (`components/social`).
- **Configurations et hooks :** utilitaires et hooks personnalisés pour le jeu local et le profil (`hooks/`, `local-game/`).

**Technologies et architecture :**

- **Framework mobile :** Expo + React Native.
- **Langage :** TypeScript (fichiers .tsx, `tsconfig.json`).
- **UI :** Tamagui (configuration dans `tamagui.config.ts`).
- **Backend / BDD :** Supabase (fichier d'accès `lib/supabase.ts`).
- **Structure :** routing basé sur le dossier `app/` (file-based routing), composants réutilisables dans `components/`.

**Installation locale (développement)**

Prérequis : Node.js, npm (ou Yarn), et `expo-cli` si vous préférez CLI globale.

```bash
npm install
npx expo start
```

Pour réinitialiser le projet (remettre le starter ailleurs) :

```bash
npm run reset-project
```

Vous pouvez ouvrir l'application dans un émulateur iOS/Android ou sur un appareil via Expo Go / development build.

**Contributeurs**

- Lucas MARROT
- Kyliann CLARET-LAVAL
- Zac DJAMAT
