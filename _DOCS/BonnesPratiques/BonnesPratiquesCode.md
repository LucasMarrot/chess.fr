# 📄 Bonnes pratiques d’architecture et de développement (Expo + Tamagui + Supabase)

Ce document définit les bonnes pratiques à suivre pour construire une application scalable, maintenable et sécurisée avec Expo, Tamagui et Supabase.

---

## 📱 1. React Native avec Expo

### 🧩 Décomposition des composants

- Favoriser des composants :
  - petits
  - réutilisables
  - testables

- Séparer clairement :
  - **présentation (UI)** → composants Tamagui
  - **logique métier** → hooks / services

- Limiter la taille des composants :
  - idéalement < 200 lignes

- Organisation recommandée :
components/
ui/ # composants purement visuels (Tamagui)
features/ # composants liés à une feature

---

### 🧠 Gestion de la logique métier (Hooks)

- Centraliser la logique dans des hooks personnalisés :
  - `useAuth`
  - `useUser`
  - `usePosts`

- Un hook = une responsabilité

- Séparer :
  - logique métier
  - appels Supabase
  - gestion d’état

- Ne jamais mettre de logique métier dans les composants UI

---

## 🎨 2. UI & Design System avec Tamagui

### 🧱 Composants UI

- Utiliser Tamagui comme **source unique de vérité UI**
- Créer des composants abstraits :
  - `Button`
  - `Text`
  - `Card`

- Éviter :
  - styles inline complexes
  - duplication de composants

---

### 🎯 Design system

- Centraliser :
  - couleurs
  - spacing
  - typographie
  - tokens

- Utiliser :
  - variants Tamagui
  - thèmes (light / dark)

---

### 📌 Bonnes pratiques

- UI = purement déclarative
- Aucun appel API dans les composants
- Aucun état métier complexe dans la UI

---

## ⚙️ 3. Gestion des actions métier

### 🧠 Architecture recommandée
features/
services/

- `features/` :
  - logique métier liée à une feature
- `services/` :
  - logique globale (auth, api, etc.)

---

### 🔌 Services

- Centraliser tous les appels Supabase dans des services :
  - `authService`
  - `userService`
  - `postService`

- Chaque service doit :
  - gérer les erreurs
  - retourner des données propres
  - être indépendant de l’UI

---

## 🗄️ 4. Supabase & accès aux données

### 🧱 Organisation
lib/
supabase.ts

services/
repositories/

---

### 📌 Bonnes pratiques

- Ne jamais appeler Supabase directement depuis :
  - composants
  - UI

- Passer uniquement par :
  - services
  - ou repositories

---

### 🔧 ORM / Abstraction

- Supabase agit déjà comme un backend + client DB

- Ajouter une abstraction (repository) si :
  - logique métier complexe
  - besoin de transformation de données
  - tests nécessaires

---

### 📊 Gestion des données

- Normaliser les réponses
- Gérer :
  - erreurs
  - loading states
  - retry

---

## 🔐 5. Authentification & navigation

### 🔑 Auth avec Supabase

- Utiliser Supabase Auth
- Centraliser dans un `AuthProvider`

- Gérer :
  - session
  - login / logout
  - refresh token

---

### 🔁 Protection des routes (Expo Router)

Structure recommandée :
app/
(auth)/
(protected)/

---

### 🚫 Redirection automatique

- Si non connecté :
  - redirection vers `/login`
- Si connecté :
  - accès aux routes protégées

- Implémenter dans :
  - layout `(protected)/_layout.tsx`

---

### 🧠 Middleware / Guard

- Recommandé dès qu’il y a :
  - authentification obligatoire
  - rôles utilisateurs

---

## 🔐 6. Sécurité

### 🔒 Données sensibles

- Ne jamais exposer :
  - clés privées
  - secrets Supabase

- Utiliser uniquement :
  - `EXPO_PUBLIC_*` pour les clés publiques

---

### 🔑 Stockage sécurisé

- Utiliser :
  - `expo-secure-store`

---

### 🛡️ Bonnes pratiques

- Valider toutes les entrées utilisateur
- Gérer :
  - expiration des sessions
  - refresh token

- Utiliser :
  - Row Level Security (RLS) Supabase

---

## 🧪 7. Tests unitaires

### 🧱 Organisation
tests/
*.test.ts

---

### ✅ À tester en priorité

- Hooks métier
- Services Supabase
- Fonctions critiques

---

### 🛠️ Outils

- Jest
- React Testing Library

---

### 📌 Bonnes pratiques

- Tests :
  - isolés
  - rapides
  - fiables

- Mocker :
  - Supabase
  - API

---

## 🚀 Bonnes pratiques générales

- Code lisible > code complexe
- Architecture claire et stable
- Séparation stricte des responsabilités
- Pas de logique métier dans la UI
- Centralisation des appels API

---

## ❌ Anti-patterns à éviter

- Appels Supabase directement dans les composants
- Composants trop gros
- Logique métier dans la UI
- Duplication de styles ou composants
- Absence de couche service

---

## ✅ Objectif

Construire une application :

- scalable
- maintenable
- testable
- sécurisée

adaptée à une stack moderne Expo + Tamagui + Supabase.