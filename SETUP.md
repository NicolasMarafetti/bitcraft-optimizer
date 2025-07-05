# Configuration de BitCraft Optimizer avec MongoDB

Ce guide vous explique comment configurer la base de données MongoDB pour BitCraft Optimizer.

## Prérequis

1. **Node.js 18+** installé
2. **MongoDB** installé et en cours d'exécution

### Installation de MongoDB

#### Sur Windows
1. Téléchargez MongoDB Community Server depuis https://www.mongodb.com/try/download/community
2. Installez en suivant l'assistant
3. Démarrez le service MongoDB

#### Sur Linux/macOS
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS avec Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Démarrer MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

## Configuration du projet

### 1. Installation des dépendances

```bash
cd bitcraft-optimizer
npm install
```

### 2. Configuration de la base de données

Le fichier `.env` est déjà configuré avec les paramètres par défaut :

```env
DATABASE_URL="mongodb://localhost:27017/bitcraft_optimizer"
NODE_ENV="development"
VITE_API_BASE_URL="http://localhost:3000"
```

### 3. Initialisation de la base de données

Exécutez cette commande pour configurer complètement la base de données :

```bash
npm run db:setup
```

Cette commande va :
1. Générer le client Prisma
2. Synchroniser le schéma avec MongoDB
3. Initialiser les 47 objets BitCraft Tier 1 en base

### 4. Vérification

Vous pouvez vérifier que tout fonctionne avec :

```bash
# Ouvrir l'interface d'administration Prisma
npm run prisma:studio
```

Cela ouvrira http://localhost:5555 où vous pourrez voir vos données.

## Démarrage de l'application

### Option 1: Application web complète (recommandé)
```bash
# Démarrer l'API backend ET le frontend
npm run dev:full
```

### Option 2: Séparément
```bash
# Terminal 1: Démarrer l'API backend
npm run server:dev

# Terminal 2: Démarrer le frontend
npm run dev
```

### Option 3: Application Electron
```bash
# Démarrer tout (API + Frontend + Electron)
npm run electron-dev
```

L'application sera disponible sur :
- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:3001
- **API Health** : http://localhost:3001/api/health

## Commandes utiles

### Base de données
```bash
# Réinitialiser uniquement les objets
npm run db:init

# Générer le client Prisma après modification du schéma
npm run prisma:generate

# Synchroniser le schéma avec la base
npm run prisma:push

# Interface d'administration
npm run prisma:studio
```

### Développement
```bash
# API Backend seul
npm run server:dev

# Frontend seul
npm run dev

# Les deux ensemble
npm run dev:full

# Build de production
npm run build

# Lancer Electron
npm run electron-dev
```

## Résolution des problèmes

### MongoDB ne démarre pas
```bash
# Vérifier le statut
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Redémarrer
sudo systemctl restart mongod  # Linux
brew services restart mongodb-community  # macOS
```

### Erreur de connexion à la base
1. Vérifiez que MongoDB est démarré
2. Vérifiez l'URL dans `.env`
3. Testez la connexion :
```bash
mongosh  # Doit se connecter sans erreur
```

### Prisma ne trouve pas la base
```bash
# Régénérer le client Prisma
npm run prisma:generate

# Forcer la synchronisation
npm run prisma:push --force-reset
npm run db:init
```

### Cache des prix vide
Les prix sont maintenant stockés en base et mis en cache automatiquement. Si le cache semble vide :

1. Vérifiez que la base contient des prix via `npm run prisma:studio`
2. Les prix sont mis en cache automatiquement au démarrage
3. Le cache se rafraîchit toutes les 30 secondes

## Structure de la base de données

### Collections créées
- `bitcraft_items` : Les 47 objets BitCraft Tier 1
- `item_prices` : Prix des objets par ville
- `crafting_costs` : Coûts de craft (pour les fonctionnalités futures)
- `farming_locations` : Lieux de farming (pour les fonctionnalités futures)
- `user_sessions` : Sessions utilisateur (pour les fonctionnalités futures)

### Architecture API + Frontend

L'application utilise maintenant une architecture séparée :
- **Backend API** (port 3001) : Gère la base de données MongoDB avec Prisma
- **Frontend React** (port 5173) : Interface utilisateur qui communique avec l'API

### Migration des données localStorage

Si vous aviez des prix dans localStorage, ils ne seront plus visibles. Vous devrez les re-saisir via l'interface, ils seront automatiquement sauvés en base de données.

### Erreurs d'API

Si vous voyez "❌ API indisponible" dans l'interface :
1. Vérifiez que le serveur API est démarré (`npm run server:dev`)
2. Vérifiez que MongoDB est en cours d'exécution
3. L'application fonctionne en mode lecture seule sans API

## Fonctionnalités

✅ **Stockage persistant** des prix en MongoDB  
✅ **Cache intelligent** pour les performances  
✅ **47 objets authentiques** BitCraft Tier 1  
✅ **Interface de gestion** des prix  
✅ **Recommendations** farming/crafting basées sur la BDD  
✅ **Sauvegarde automatique** lors de modifications  

L'application est maintenant prête avec une vraie base de données !