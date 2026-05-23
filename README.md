# Gestion Pédagogique — Frontend

Interface web de la plateforme de gestion pédagogique **Ecole 221**, développée avec React, Vite et TailwindCSS.

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| React | 19 | UI |
| Vite | 8 | Bundler / Dev server |
| TailwindCSS | 3 | Styles |
| React Router | 7 | Navigation / Routes |
| Axios | 1 | Appels HTTP |
| Zustand | 5 | État global (auth) |

## Prérequis

- Node.js >= 18
- Le backend Laravel doit tourner sur `http://localhost:8000`

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

L'application tourne sur `http://localhost:5173`.

## Build production

```bash
npm run build
```

## Configuration

L'URL de l'API est définie dans `src/api/axios.js`. Par défaut :

```js
baseURL: 'http://localhost:8000/api/v1'
```

Modifier cette valeur pour pointer vers le serveur de production.

## Structure du projet

```
src/
├── api/                    # Fonctions d'appel API (une par domaine)
│   ├── axios.js            # Instance Axios avec Bearer token
│   ├── authApi.js          # Login, logout, reset mot de passe
│   ├── usersApi.js         # CRUD utilisateurs
│   ├── coursApi.js         # Cours, sessions, heures, bilan
│   ├── referentielApi.js   # Classes, salles, modules, semestres, années
│   ├── inscriptionsApi.js  # Inscriptions étudiants
│   └── absencesApi.js      # Absences, émargements, justifications
│
├── components/             # Composants réutilisables
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── PrivateRoute.jsx    # Protection des routes par rôle
│   ├── ConfirmModal.jsx    # Modal de confirmation (remplace browser confirm)
│   └── ui/                 # Composants UI génériques
│
├── pages/
│   ├── Login.jsx
│   ├── MotDePasseOublie.jsx
│   ├── manager/            # Pages rôle MANAGER
│   ├── cm/                 # Pages rôle CM (Attaché pédagogique)
│   ├── coach/              # Pages rôle COACH (Professeur)
│   └── etudiant/           # Pages rôle APPRENANT
│
├── store/
│   └── authStore.js        # État auth global (Zustand + persist)
│
└── App.jsx                 # Définition de toutes les routes
```

## Rôles et accès

| Rôle | Route | Périmètre |
|---|---|---|
| `MANAGER` | `/manager` | Tableau de bord, utilisateurs, cours, sessions, inscriptions, référentiels |
| `CM` | `/cm` | Validation sessions, absences, bilan professeurs |
| `COACH` | `/coach` | Mes cours, mes sessions, mes heures |
| `APPRENANT` | `/etudiant` | Mes cours, mes sessions, mes absences |

La redirection après login se fait automatiquement selon le rôle retourné par l'API.

## Fonctionnalités par rôle

### MANAGER
- Gestion des utilisateurs (créer, modifier, supprimer)
- Gestion des cours (création, suppression, liste des étudiants inscrits)
- Planification et modification des sessions de cours
- Import d'étudiants par fichier Excel/CSV
- Gestion des référentiels : classes, salles, modules, semestres, années scolaires
- Assignation des classes aux années scolaires

### CM (Attaché pédagogique)
- Validation des sessions passées → génère automatiquement les absences
- Consultation des émargements par session (liste des présents)
- Traitement des justifications d'absence (accepter / refuser)
- Bilan mensuel par professeur (heures effectuées vs quota)
- Absences consultables par étudiant et par professeur

### COACH (Professeur)
- Consultation de ses cours et sessions filtrables par période
- Annulation d'une session planifiée
- Suivi de ses heures effectuées par mois

### APPRENANT (Étudiant)
- Consultation de ses cours et sessions
- Signature de présence (disponible 30 min après le début du cours)
- Suivi de ses absences avec statistiques (total / justifiées / comptées)
- Soumission de justifications d'absence

## Comptes de test

| Rôle | Login | Mot de passe |
|---|---|---|
| MANAGER | `mdiallo` | `password123` |
| CM | `fndiaye` | `pedagogie@` |
| COACH | `ifall` | `pedagogie@` |
| APPRENANT | `csarr` | `pedagogie@` |

## Authentification

- Login via `POST /api/v1/login` avec identifiant (`login`) + mot de passe
- Token Bearer stocké dans `localStorage` via Zustand + middleware `persist`
- Routes protégées par `<PrivateRoute roles={[...]}>` qui vérifie le rôle
- Déconnexion : `GET /api/v1/logout`

## Réinitialisation du mot de passe

Flux en deux étapes sans quitter le navigateur :
1. Saisir son identifiant → code à 6 chiffres généré côté backend (valable 30 min)
2. Saisir le code reçu par email + nouveau mot de passe → redirection vers le login

## Conventions de développement

- Tous les appels API passent par les fichiers `src/api/` — aucun appel `axios` direct dans les pages
- Les modaux sont définis **en dehors** des composants parents pour éviter la perte de focus lors de la saisie
- Les messages de succès/erreur disparaissent automatiquement après 3 secondes
- Les confirmations de suppression passent par `<ConfirmModal>` — jamais `window.confirm()`
- Les statuts sont toujours affichés avec des badges colorés
