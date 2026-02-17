# Sprint Planning : ChessApp

**Équipe :** 3 Développeurs | **Budget Temps :** 90h Total (30h/pers) | **Structure :** 5 Sprints de 18h (6h/dev/sprint) + 1 Sprint Bonus

Ce planning respecte la contrainte de rendre le jeu local jouable dès le premier sprint, d'automatiser les processus dès le début, et de garder l'IA et les modes fun pour la fin.

## 🏁 Sprint 1 : Fondations & Jeu Local (MVP Hotseat)

**Objectif :** L'application est installée, l'utilisateur est authentifié et deux joueurs peuvent jouer une partie complète (avec Timer) sur le même appareil.

### Backlog Exhaustif

* **Init Repo & Expo :** Initialiser le projet Expo (TypeScript) et configurer `app.json`.
* **Linting & Formatting :** Configurer **ESLint** et **Prettier** pour garantir la qualité et la cohérence du code dès le début.
* **CI/CD Web :** Configurer le workflow GitHub Actions pour automatiser le déploiement Web (Vercel/Expo) à chaque push.
* **Config UI :** Installer Tamagui, configurer le thème et le Provider racine.
* **Init Supabase :** Créer le projet et configurer le client Supabase dans l'app.
* **Auth Backend :** Activer Auth Email/Password et créer la table `profiles` (trigger création user).
* **Écrans Auth :** Développer les formulaires Login, Register et Mot de passe oublié.
* **Navigation :** Mettre en place Expo Router avec protection des routes (Redirection si non connecté).
* **Écran Profil :** Afficher les infos de base (Avatar, Pseudo) et le bouton Déconnexion.
* **Composant Plateau :** Intégrer `react-native-chessboard` de manière responsive.
* **Moteur de Règles :** Intégrer `chess.js` pour la validation des coups légaux.
* **Logique Fin de Partie :** Détecter Mat, Pat et Nulle (Modale de résultat locale).
* **Feature Timer :** Créer un composant compte à rebours paramétrable (ex: 10 min).
* **Sélecteur Cadence :** Écran avant-match pour choisir le temps (5/10/30 min).
* **Feature Rotation :** Ajouter un bouton pour inverser le plateau (Vue Noirs/Blancs) manuellement.

## ⚡ Sprint 2 : Cœur Online (Matchmaking & Sync)

**Objectif :** Connecter deux joueurs distants. Gérer la recherche de partie et la synchronisation des coups en temps réel.

### Backlog Exhaustif

* **Schema DB Games :** Créer la table `games` (fen, pgn, status, timer, visibility, players IDs).
* **Sécurité (RLS) :** Sécuriser la table `games` (modif autorisée seulement au joueur dont c'est le tour).
* **RPC Matchmaking :** Écrire la fonction SQL `find_match` (Logique "Rejoindre ou Créer" avec filtre cadence).
* **Store Global :** Mettre en place Zustand pour l'état de la partie active (Online).
* **Hook Realtime :** Créer l'abonnement Supabase aux changements de la table `games`.
* **Sync Coups :** Connecter l'UI : Coup joué -> Update DB -> Réception Adversaire.
* **Sync Timer :** Gérer le temps restant basé sur `last_move_at` (timestamp serveur).
* **Gestion Abandons :** Gérer le cas où un joueur quitte l'app ou clique sur "Abandonner".
* **Gestion Nulle :** Implémenter le flux de proposition de match nul (Bouton "Proposer", Notification, Accepter/Refuser).
* **UI Lobby :** Créer l'écran de recherche avec spinner et annulation.
* **Handshake :** Afficher les infos de l'adversaire (Avatar/Pseudo/ELO) au début du match.

## 📊 Sprint 3 : Données, Statistiques & Historique

**Objectif :** Donner de la persistance et de la valeur aux parties jouées (Suivi de progression).

### Backlog Exhaustif

* **Trigger Stats :** Créer un trigger SQL `on_game_finish` pour incrémenter automatiquement Wins/Losses/Draws.
* **Calcul ELO :** Implémenter l'algorithme de mise à jour du score ELO dans le trigger ou une fonction DB.
* **API Historique :** Créer la requête pour récupérer les 50 dernières parties d'un utilisateur.
* **Écran Historique :** Afficher la liste des parties (Date, Adversaire, Résultat, Variation ELO).
* **Détail Partie :** Permettre de cliquer sur une partie pour voir le plateau final ou le PGN.
* **UI Stats Profil :** Ajouter des indicateurs visuels sur le profil (Jauge de Winrate, Évolution ELO).
* **Classement (Leaderboard) :** Créer une page simple listant les top joueurs par ELO.
* **Page Tutoriel :** Créer une page statique expliquant les règles de base (déplacement des pièces) et 2-3 conseils stratégiques pour débutants.

## 🤝 Sprint 4 : Social & Administration

**Objectif :** Créer de l'interaction entre joueurs et fournir les outils de modération.

### Backlog Exhaustif

* **Schema Social :** Créer les tables `friendships` (status: pending/accepted) et `messages`.
* **Recherche Ami :** UI pour rechercher un utilisateur par son pseudo exact.
* **Gestion Demandes :** Envoyer une demande, lister les reçues, Accepter/Refuser.
* **Défier Ami :** Créer une partie privée via bouton sur la liste d'amis (+ Notification invitation).
* **Chat Backend :** Sécuriser les messages (RLS : seulement participants ou amis).
* **Chat UI :** Intégrer la bulle de chat dans l'écran de jeu et une vue conversation privée.
* **Schema Admin :** Ajouter une colonne `role` ('user'/'admin') dans la table profiles.
* **Panel Admin :** Créer une vue (accessible seulement si admin) listant tous les utilisateurs.
* **Actions Admin :** Boutons pour Bannir (bloquer login) ou Supprimer un utilisateur.

## 🤖 Sprint 5 : Intelligence Artificielle & Finalisation

**Objectif :** Ajouter le mode solo (IA) et polir l'application pour le rendu final.

### Backlog Exhaustif

* **Moteur IA :** Intégrer `stockfish.js` (WASM) dans le projet.
* **Web Worker :** Configurer l'exécution de l'IA dans un thread séparé (pour ne pas figer l'UI).
* **Logique Jeu IA :** Connecter le plateau : Coup Joueur -> Calcul Stockfish -> Coup IA.
* **Niveaux Difficulté :** UI pour limiter la force de l'IA (Temps de réflexion ou Profondeur).
* **Sons :** Ajouter les effets sonores (Move, Capture, Check, Game Start/End).
* **Haptique :** Ajouter les vibrations légères sur mobile lors des interactions.
* **Icônes & Splash :** Générer les assets natifs pour iOS et Android.
* **Config Production :** Préparer `eas.json` et les variables d'environnement de prod.
* **Build Final :** Générer l'APK final (Android).

## 🚀 Sprint 6 : Bonus & Experimental (Modes Fun & DevOps Avancé)

**Objectif :** Aller au-delà du cahier des charges avec des modes de jeu "fun" et une infrastructure professionnelle.

### Backlog Exhaustif

* **Mode Duck Chess :** Implémenter la logique où chaque joueur doit déplacer un "canard" (bloqueur) après son coup.
* **Mode Fog of War :** Modifier le rendu du plateau pour masquer les pièces adverses non menacées (vision limitée).
* **Mode Crazy House :** Permettre de "dropper" les pièces capturées sur le plateau (nécessite UI réserve de pièces).
* **Mode Puzzles (Stockfish) :** Implémenter un générateur de puzzles tactiques utilisant Stockfish pour évaluer des positions et proposer des défis (Mat en N coups).
* **Mode 960 (Fischer Random) :** Algorithme de génération aléatoire de la position initiale des pièces.
* **Architecture Variantes :** Refactoriser le moteur de règles pour supporter des règles alternatives sans casser le jeu classique.
* **Monitoring Erreurs :** Intégrer **Sentry** pour tracker les crashs JS en production (Web & Mobile).
* **Analytics Web :** Ajouter **PostHog** ou Vercel Analytics pour suivre le nombre de parties jouées et les visites.
* **Performance Monitoring :** Configurer Lighthouse CI dans GitHub Actions pour surveiller les scores de performance Web.
* **Dashboards Supabase :** Créer des vues SQL pour visualiser les KPIs (Retention, Daily Active Users).