# CampusMateriel : Guide d'Installation, Jeu de Données et Démonstration du Parcours Complet

Ce document présente une vue d'ensemble exhaustive du projet **CampusMateriel**, incluant la procédure d'installation, un jeu de données initial de départ, une démonstration détaillée du parcours utilisateur, ainsi que la validation des règles métier par les tests.

---

## 1. Guide d'Installation et Configuration

### Prérequis Techniques
* **Docker** et **Docker Compose** (recommandé pour l'orchestration de la base de données).
* **Node.js** (v18+) et **npm** pour le client React.
* **Git** pour le versionnage.

### Procédure d'Installation Pas à Pas

1. **Clonage du dépôt :**
   ```bash
   git clone https://github.com/Marfael34/campus_materiel.git
   cd campus_materiel
   ```

2. **Configuration des variables d'environnement (`.env`) :**
   À la racine du projet, créez votre fichier `.env` :
   ```env
   PORT=5000
   MONGODB_URI=mongodb://admin:Admin2026@localhost:27017/campus_materiel?authSource=admin
   JWT_SECRET=cle_secrete_campus_2026
   ```

3. **Lancement de l'infrastructure (Docker Compose) :**
   ```bash
   docker compose up -d
   ```

4. **Installation et lancement du Client (Frontend Vite + React) :**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   L'application est accessible sur `http://localhost:5173`.

---

## 2. Jeu de Données de Départ (Seeding Initial)

Voici le jeu de données initial injecté dans la base MongoDB pour initialiser l'application lors du premier démarrage.

### A. Collection `users` (Utilisateurs)
```json
[
  {
    "_id": "65e1a2b3c4d5e6f7a8b9c0d1",
    "name": "Marie Curie",
    "email": "marie.curie@campus.edu",
    "password": "$2a$12$e0...h8 (haché bcrypt)",
    "role": "admin",
    "createdAt": "2026-03-01T08:00:00.000Z"
  },
  {
    "_id": "65e1a2b3c4d5e6f7a8b9c0d2",
    "name": "Jean Dupont",
    "email": "jean.dupont@etu.campus.edu",
    "password": "$2a$12$k9...p2 (haché bcrypt)",
    "role": "student",
    "createdAt": "2026-03-01T08:30:00.000Z"
  }
]
```

### B. Collection `equipment` (Équipements)
```json
[
  {
    "_id": "65e2b3c4d5e6f7a8b9c0d101",
    "name": "Caméra Sony Alpha 7 IV",
    "category": "Audiovisuel",
    "totalStock": 5,
    "availableStock": 4,
    "status": "Disponible",
    "location": "Armoire A1"
  },
  {
    "_id": "65e2b3c4d5e6f7a8b9c0d102",
    "name": "MacBook Pro 16 M3",
    "category": "Informatique",
    "totalStock": 10,
    "availableStock": 10,
    "status": "Disponible",
    "location": "Armoire B2"
  }
]
```

---

## 3. Démonstration du Parcours Utilisateur Complet

Le parcours utilisateur se déroule en 4 étapes clés :

1. **Authentification :**
   * L'utilisateur se connecte via `/login` avec ses identifiants (`jean.dupont@etu.campus.edu`).
   * Le serveur émet un jeton JWT valide stocké dans le navigateur.

2. **Consultation du Catalogue :**
   * L'étudiant navigue sur le tableau de bord et consulte la liste des équipements disponibles (ex: Caméras, Ordinateurs). Le stock affiché en temps réel indique le nombre d'unités libres.

3. **Demande de Réservation / Emprunt :**
   * L'utilisateur sélectionne *Caméra Sony Alpha 7 IV* (quantité : 1) et valide sa demande pour une période de 48 heures.
   * Le système vérifie la disponibilité ($Stock_{disponible} > 0$).

4. **Validation et Restitution :**
   * Un administrateur valide l'emprunt. Le stock disponible passe instantanément de $4$ à $3$.
   * Lors de la restitution du matériel, le stock est incrémenté et revient à $4$.

---

## 4. Tests sur les Règles Métier Principales

Les règles métier critiques font l'objet de tests automatisés (Jest / Pytest) et de vérifications d'intégrité en base de données.

| Référence | Règle Métier | Principe & Implantation | Cas de Test & Validation |
| :--- | :--- | :--- | :--- |
| **RM-01** | **Sécurité des mots de passe** | Aucun mot de passe en clair. Hachage systématique avec `bcryptjs`. | **Test :** Insertion d'un utilisateur et vérification de la présence du préfixe de hachage `$2a$` / `$2b$` en base. **Résultat :** Conforme. |
| **RM-02** | **Intégrité des schémas de données** | Application de validateurs stricts au niveau de MongoDB pour bloquer les documents incomplets. | **Test :** `db.equipment.insertOne({ description: "Sans nom" })`. **Résultat :** Erreur de validation levée par le SGBD. |
| **RM-03** | **Gestion dynamique des stocks** | Le stock disponible est mis à jour atomiquement lors de l'emprunt :<br>$$Stock_{disponible} = Stock_{total} - Encours$$ | **Test :** Simulation de 5 emprunts simultanés sur un stock de 5. Le 6ème est rejeté (`Stock épuisé`). **Résultat :** Conforme. |
