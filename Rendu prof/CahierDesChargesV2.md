# Cahier des charges  
## Projet : Application de jeu d’échecs en ligne

---

## 1. Présentation du projet

Le projet consiste à développer une **application de jeu d’échecs** inspirée de plateformes existantes comme *Chess.com*.  
L’application permettra aux utilisateurs de jouer aux échecs selon plusieurs modes (en ligne, local, contre IA), de gérer leur compte, leurs statistiques et d’interagir avec d’autres joueurs.


---

## 2. Objectif de l’application

L’objectif est de proposer une application :
- simple à utiliser,
- accessible sur **web et mobile**,
- permettant de jouer aux échecs dans différents contextes,
- offrant un suivi des performances (statistiques, classement),
- intégrant des fonctionnalités sociales de base.

---

## 3. Type de projet et utilisateurs visés

### Type de projet
- Application web et mobile

### Utilisateurs visés
- Joueurs occasionnels
- Joueurs réguliers
- Joueurs débutants
- Administrateurs de la plateforme

---

## 4. Analyse des besoins

### 4.1 Reformulation des besoins principaux

Les besoins essentiels sont :
- Créer et gérer un compte utilisateur
- Jouer aux échecs dans plusieurs modes
- Choisir une cadence de jeu
- Sécuriser l’accès aux comptes
- Conserver l’historique des parties

---

### 4.2 Besoins évidents ajoutés

Pour garantir la cohérence du système :
- Vérification des identifiants lors de la connexion
- Gestion des sessions utilisateurs
- Sauvegarde des données
- Gestion des erreurs (déconnexion, partie interrompue)
- Interface claire et ergonomique

---

## 5. Fonctionnalités

### 5.1 Fonctionnalités essentielles (V1)

#### Gestion des utilisateurs
- Création d’un compte utilisateur
- Authentification (connexion)

#### Jeu d’échecs
- Jouer une partie en ligne contre un joueur
- Jouer à deux sur le même appareil
- Choisir une cadence de jeu

#### Système
- Gestion des parties en cours
- Fin de partie avec résultat (victoire, défaite, nul)

---

### 5.2 Fonctionnalités importantes (V2)

#### Gestion des utilisateurs
- Se déconnecter
- Consulter son profil
- Consulter ses statistiques
- Consulter son classement (ELO)
- Consulter l’historique des parties

#### Modes de jeu
- Jouer en ligne contre un ami
- Jouer hors ligne contre une IA
- Rotation du plateau en mode local

#### Interactions sociales
- Envoyer une demande d’ami
- Accepter ou refuser une demande d’ami
- Consulter la liste d’amis
- Chat pendant une partie
- Chat entre amis

#### Administration
- Connexion administrateur
- Consulter la liste des utilisateurs
- Supprimer un compte utilisateur
- Bannir un utilisateur

#### Système
- Mise à jour des statistiques après une partie
- Mise à jour du classement ELO
- Enregistrement des parties

---

### 5.3 Fonctionnalités secondaires (V3)

- Choix de modes de jeu avancés
- Filtrage des messages inappropriés
- Tutoriel des règles des échecs
- Puzzles d’échecs
- Analyse de partie par IA

---

## 6. Acteurs concernés

- **Utilisateur** : joueur utilisant l’application
- **Administrateur** : gestion et modération de la plateforme
- **Système** : gestion automatique des données

---

## 7. Contraintes et exigences

### 7.1 Sécurité et gestion des données
- Stockage sécurisé des mots de passe
- Protection des données personnelles
- Accès restreint aux fonctionnalités sensibles
- Gestion des comptes bannis ou supprimés

---

### 7.2 Performance et fiabilité
- Temps de réponse rapide
- Synchronisation fiable des parties en ligne
- Gestion des déconnexions
- Stabilité globale du système

---

### 7.3 Compatibilité
- Compatible navigateur web
- Compatible mobile (Android / iOS)
- Interface responsive

---

## 8. Risques et limites du projet

### 8.1 Risques techniques
- Synchronisation des parties en ligne
- Calcul correct du classement ELO
- Implémentation de l’IA

### 8.2 Limites du projet
- Fonctionnalités avancées limitées
- IA de niveau bas à intermédiaire
- Absence de tournois complexes
