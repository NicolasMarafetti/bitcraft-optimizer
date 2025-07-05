# BitCraft Optimizer

Une application desktop pour optimiser vos gains dans BitCraft en trouvant les meilleures ressources à farmer et les objets les plus rentables à crafter.

## Fonctionnalités

- 📊 **Base de données complète** : Tous les objets BitCraft Tier 1 avec leurs informations
- 💰 **Gestion des prix** : Définissez les prix des objets dans votre ville
- 🌾 **Recommandations de farming** : Trouvez les ressources les plus rentables à récolter
- 🔨 **Recommandations de crafting** : Optimisez vos profits avec les meilleurs crafts
- 🎯 **Interface intuitive** : Navigation facile entre les différentes sections

## Technologies utilisées

- **Frontend** : React + TypeScript + TailwindCSS
- **Desktop** : Electron
- **Base de données** : MongoDB + Prisma
- **Build** : Vite

## Installation

1. Clonez le repository
```bash
git clone [url-du-repo]
cd bitcraft-optimizer
```

2. Installez les dépendances (nécessite Node.js 20+)
```bash
npm install
```

3. Configurez la base de données
```bash
cp .env.example .env
# Éditez le fichier .env avec vos paramètres MongoDB
```

4. Générez le client Prisma
```bash
npm run prisma:generate
```

## Utilisation

### Mode développement
```bash
# Lancer l'application web
npm run dev

# Lancer l'application Electron
npm run electron-dev
```

### Mode production
```bash
# Construire l'application
npm run build

# Lancer l'application Electron
npm run electron

# Créer un package distributable
npm run electron-pack
```

## Structure du projet

```
bitcraft-optimizer/
├── src/
│   ├── components/     # Composants React réutilisables
│   ├── pages/         # Pages principales de l'application
│   ├── data/          # Données JSON des objets BitCraft
│   ├── types/         # Définitions TypeScript
│   ├── utils/         # Utilitaires et logique métier
│   └── App.tsx        # Composant principal
├── public/            # Fichiers statiques + main Electron
├── prisma/            # Schéma de base de données
└── package.json
```

## Utilisation de l'application

### 1. Consulter les objets
- Naviguez vers la page "Objets"
- Explorez les 20 objets Tier 1 disponibles
- Filtrez par type (ressources, objets craftés, outils, équipement)
- Recherchez un objet spécifique

### 2. Définir les prix
- Allez dans la section "Prix"
- Ajoutez les prix actuels des objets dans votre ville
- Gérez et modifiez les prix existants

### 3. Obtenir des recommandations
- Consultez la page "Recommandations"
- Découvrez les meilleures ressources à farmer
- Trouvez les crafts les plus rentables
- Analysez vos profits potentiels

## Données incluses

### Objets Tier 1 (20 objets)
- **Ressources de base** : Bois, Pierre, Fibre, Baies, Champignons
- **Outils** : Hache, Pioche, Couteau
- **Matériaux craftés** : Planches, Briques, Corde, Torche
- **Équipement** : Chapeau, Tunique, Pantalon, Chaussures
- **Stations** : Coffre, Feu de camp
- **Nourriture** : Baies cuites, Ragoût

### Recettes de craft
- 15 recettes complètes avec matériaux requis
- Temps de crafting pour chaque objet
- Relations entre objets et matériaux

## Fonctionnalités avancées

### Algorithme d'optimisation
- Calcul automatique du profit par heure pour le farming
- Analyse des marges bénéficiaires pour le crafting
- Recommandations basées sur les prix actuels du marché

### Stockage local
- Sauvegarde automatique des prix dans le localStorage
- Persistance des données entre les sessions
- Gestion par ville pour différents serveurs

## Développement

### Ajouter de nouveaux objets
1. Modifiez `src/data/bitcraft-items-tier1.json`
2. Ajoutez les recettes dans `src/data/crafting-recipes.json`
3. L'application se met à jour automatiquement

### Personnaliser l'interface
- Modifiez les couleurs dans `tailwind.config.js`
- Ajustez les composants dans `src/components/`
- Personnalisez les pages dans `src/pages/`

## Limitations actuelles

- Données limitées au Tier 1 (base du jeu)
- Pas de connexion à une API officielle BitCraft
- Gestion manuelle des prix
- Une seule ville par session

## Feuille de route

- [ ] Ajout des objets Tier 2 et supérieurs
- [ ] Intégration avec des APIs BitCraft communautaires
- [ ] Gestion multi-villes
- [ ] Historique des prix
- [ ] Export des données
- [ ] Mode hors ligne complet

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Ajouter de nouveaux objets ou recettes

## Licence

MIT - Voir le fichier LICENSE pour plus de détails.