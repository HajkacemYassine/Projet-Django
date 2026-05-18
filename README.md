# Projet Django - MyShop

## Description
Ce projet est une application web complète construite avec Django pour le backend et React pour le frontend. Il inclut des fonctionnalités avancées telles que la gestion des produits, des commandes, des utilisateurs, ainsi que des prédictions basées sur des modèles d'intelligence artificielle.

## Structure du Projet

### Backend
Le backend est un projet Django situé dans le dossier `mysite2026`. Il inclut plusieurs applications :

- **magasin** : Gère les produits, les catégories, les commandes, et les fournisseurs.
- **miniprojet** : Contient des fonctionnalités supplémentaires spécifiques.
- **ml_models** : Implémente des modèles d'intelligence artificielle pour des prédictions avancées.

#### Points Clés
- **Fichiers principaux** :
  - `manage.py` : Commande principale pour gérer le projet Django.
  - `settings.py` : Configuration du projet.
  - `urls.py` : Routes principales de l'application.
- **Base de données** : SQLite (`db.sqlite3`).
- **Migrations** : Situées dans les dossiers `migrations/` de chaque application.

### Frontend
Le frontend est une application React située dans le dossier `frontend/myshop-frontend`.

#### Points Clés
- **Fichiers principaux** :
  - `App.jsx` : Point d'entrée principal de l'application React.
  - `vite.config.js` : Configuration de Vite pour le bundling.
  - `package.json` : Liste des dépendances et scripts npm.
- **Dossiers** :
  - `src/` : Contient les composants React.
  - `public/` : Contient les fichiers statiques.

## Fonctionnalités

### Backend
- Gestion des produits, catégories, commandes, et fournisseurs.
- API REST pour interagir avec le frontend.
- Prédictions basées sur des modèles d'IA (ex. : prédiction de la demande de sang).

### Frontend
- Interface utilisateur moderne et réactive.
- Tableau de bord pour visualiser les données.
- Fonctionnalités avancées comme le suivi des livraisons.

## Installation

### Prérequis
- Python 3.10+
- Node.js 16+
- npm ou yarn

### Étapes

#### Backend
1. Naviguez dans le dossier `mysite2026`.
2. Installez les dépendances Python :
   ```bash
   pip install -r requirements.txt
   ```
3. Appliquez les migrations :
   ```bash
   python manage.py migrate
   ```
4. Lancez le serveur de développement :
   ```bash
   python manage.py runserver
   ```

#### Frontend
1. Naviguez dans le dossier `frontend/myshop-frontend`.
2. Installez les dépendances npm :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Tests

### Backend
- Tests unitaires :
  ```bash
  python manage.py test
  ```

### Frontend
- Tests automatiques :
  ```bash
  npm test
  ```

## Contribution

1. Forkez le projet.
2. Créez une branche pour vos modifications :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Soumettez une pull request.

## Auteurs
- **Yassine**

## Licence
Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.