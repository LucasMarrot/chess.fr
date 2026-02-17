# Cahier des charges

## Application de jeu d’échecs en ligne (Web & Mobile)

---

## 1. Contexte et objectif du projet

Dans le cadre de ce projet, l’équipe adopte une organisation inspirée des méthodes de gestion de projet agiles.
Deux membres de l’équipe jouent le rôle de **clients**, responsables de l’expression des besoins fonctionnels et des attentes générales.
Un troisième membre assure le rôle de **rédacteur et analyste**, chargé de formaliser et structurer ces besoins afin de produire un cahier des charges clair et exploitable pour le développement.

L’objectif du projet est de concevoir et développer une **application de jeu d’échecs en ligne**, accessible :

* sur **navigateur web**
* sur **terminaux mobiles Android et iOS**

L’application doit proposer une expérience simple, fluide et intuitive, comparable à des plateformes existantes telles que *Chess.com*, tout en restant adaptée aux contraintes pédagogiques et techniques du projet.

---

## 2. Périmètre du projet

L’application devra permettre :

* la gestion des utilisateurs et de leurs profils
* la pratique du jeu d’échecs en ligne et hors ligne
* des interactions sociales entre joueurs
* un accompagnement pédagogique pour les débutants
* une administration et une modération de la plateforme

---

## 3. Fonctionnalités attendues

### 3.1 Gestion des utilisateurs

L’application devra proposer :

* la **création de compte utilisateur**
* l’**authentification** (connexion / déconnexion)
* l’accès à un **profil personnel**

Chaque profil utilisateur devra afficher :

* le nombre total de parties jouées
* le nombre de victoires, défaites et parties nulles
* un **classement basé sur un système de type ELO**
* l’**historique des parties jouées**

---

### 3.2 Système de jeu d’échecs

L’application devra intégrer un **moteur de jeu d’échecs complet**, respectant les règles officielles.

#### Modes de jeu

* **En ligne** :

  * contre un ami
  * contre d’autres joueurs aléatoires
* **Hors ligne** :

  * contre une intelligence artificielle
  * à deux joueurs sur le même appareil (jeu local)

#### Options de jeu

* rotation automatique du plateau en mode local
* choix de la cadence de jeu :

  * blitz
  * rapide
  * classique

---

### 3.3 Interactions sociales

L’application devra inclure :

* un **système de chat** entre joueurs durant une partie
* un **système d’amis** :

  * envoi de demandes d’amis
  * acceptation ou refus des demandes

Un **filtre de langage** devra être mis en place afin de limiter les propos inappropriés et garantir une expérience respectueuse.

---

### 3.4 Fonctionnalités pédagogiques

L’application devra proposer :

* un **tutoriel d’initiation** expliquant les règles du jeu d’échecs
* une prise en main progressive pour les joueurs débutants

Fonctionnalités envisagées comme **évolutions possibles** :

* puzzles d’échecs
* analyse automatique des parties via une intelligence artificielle

---

### 3.5 Administration et modération

Un **compte administrateur** devra être mis en place avec les fonctionnalités suivantes :

* suppression de comptes utilisateurs
* bannissement d’utilisateurs en cas de comportement inapproprié
* supervision globale du bon fonctionnement de la plateforme

---

## 4. Contraintes techniques

* Application **multiplateforme** (Web, Android, iOS)
* Interface **responsive** et adaptée aux écrans mobiles
* Performances suffisantes pour des parties en temps réel
* Sécurité minimale des données utilisateurs (authentification, accès aux profils)

---

## 5. Produit Minimum Viable (MVP)

Les fonctionnalités indispensables du MVP sont :

* création et authentification des comptes utilisateurs
* jeu d’échecs en ligne entre deux joueurs
* jeu hors ligne à deux sur le même appareil
* affichage des statistiques principales
* tutoriel de base
* compte administrateur avec fonctions essentielles

Les fonctionnalités optionnelles (évolutives) :

* intelligence artificielle avancée
* puzzles d’échecs
* analyse automatique des parties
* fonctionnalités sociales avancées

---

## 6. Conclusion

Ce cahier des charges définit la base fonctionnelle du projet.
Il servira de référence pour :

* cadrer le développement
* prioriser les fonctionnalités
* distinguer les éléments du MVP des évolutions futures

L’ensemble des choix techniques et fonctionnels devra respecter les contraintes de temps, de compétences et d’objectifs pédagogiques du projet.
