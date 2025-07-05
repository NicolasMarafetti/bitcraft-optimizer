const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Charger les variables d'environnement
dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BitCraft Optimizer API is running' })
})

// Routes pour les objets BitCraft
app.get('/api/items', async (req, res) => {
  try {
    const items = await prisma.bitCraftItem.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(items)
  } catch (error) {
    console.error('Erreur lors de la récupération des objets:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/items/init', async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Liste d\'objets requise' })
    }

    let createdCount = 0
    for (const item of items) {
      await prisma.bitCraftItem.upsert({
        where: { name: item.name },
        update: {
          tier: item.tier,
          type: item.type,
          description: item.description,
          rarity: item.rarity,
          imageUrl: item.imageUrl,
          farmingTime: item.farmingTime,
          craftingTime: item.craftingTime,
        },
        create: {
          name: item.name,
          tier: item.tier,
          type: item.type,
          description: item.description,
          rarity: item.rarity,
          imageUrl: item.imageUrl,
          farmingTime: item.farmingTime,
          craftingTime: item.craftingTime,
        },
      })
      createdCount++
    }
    
    res.json({ 
      success: true, 
      message: `${createdCount} objets initialisés`,
      count: createdCount 
    })
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des objets:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/items', async (req, res) => {
  try {
    const { name, tier, imageUrl } = req.body
    
    if (!name || !tier) {
      return res.status(400).json({ error: 'Le nom et le tier sont requis' })
    }
    
    const existingItem = await prisma.bitCraftItem.findUnique({
      where: { name }
    })
    
    if (existingItem) {
      return res.status(409).json({ error: 'Un objet avec ce nom existe déjà' })
    }
    
    const newItem = await prisma.bitCraftItem.create({
      data: {
        name,
        tier: parseInt(tier),
        type: 'crafted',
        imageUrl: imageUrl || null
      }
    })
    
    res.status(201).json(newItem)
  } catch (error) {
    console.error('Erreur lors de la création de l\'objet:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.delete('/api/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    
    const item = await prisma.bitCraftItem.findUnique({
      where: { id: itemId }
    })
    
    if (!item) {
      return res.status(404).json({ error: 'Objet non trouvé' })
    }
    
    await prisma.itemPrice.deleteMany({
      where: { itemId: itemId }
    })
    
    await prisma.bitCraftItem.delete({
      where: { id: itemId }
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'objet:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Routes pour les prix
app.get('/api/prices/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params
    
    const prices = await prisma.itemPrice.findMany({
      where: { cityName },
      include: {
        item: true
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    })
    
    res.json(prices)
  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.get('/api/prices/:cityName/:itemName', async (req, res) => {
  try {
    const { cityName, itemName } = req.params
    
    const item = await prisma.bitCraftItem.findUnique({
      where: { name: itemName }
    })
    
    if (!item) {
      return res.status(404).json({ error: 'Objet non trouvé' })
    }
    
    const price = await prisma.itemPrice.findUnique({
      where: {
        itemId_cityName: {
          itemId: item.id,
          cityName: cityName
        }
      }
    })
    
    if (!price) {
      return res.json({ price: null })
    }
    
    res.json({ price: price.price })
  } catch (error) {
    console.error('Erreur lors de la récupération du prix:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/prices', async (req, res) => {
  try {
    const { itemName, price, cityName } = req.body
    
    if (!itemName || price == null || !cityName) {
      return res.status(400).json({ error: 'itemName, price et cityName sont requis' })
    }
    
    const item = await prisma.bitCraftItem.findUnique({
      where: { name: itemName }
    })
    
    if (!item) {
      return res.status(404).json({ error: 'Objet non trouvé' })
    }
    
    const itemPrice = await prisma.itemPrice.upsert({
      where: {
        itemId_cityName: {
          itemId: item.id,
          cityName: cityName
        }
      },
      update: {
        price: parseFloat(price),
        lastUpdated: new Date()
      },
      create: {
        itemId: item.id,
        price: parseFloat(price),
        cityName: cityName,
        lastUpdated: new Date()
      }
    })
    
    res.json({
      id: itemPrice.id,
      price: itemPrice.price,
      cityName: itemPrice.cityName,
      lastUpdated: itemPrice.lastUpdated
    })
  } catch (error) {
    console.error('Erreur lors de l\'ajout du prix:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.delete('/api/prices/:cityName/:itemName', async (req, res) => {
  try {
    const { cityName, itemName } = req.params
    
    const item = await prisma.bitCraftItem.findUnique({
      where: { name: itemName }
    })
    
    if (!item) {
      return res.status(404).json({ error: 'Objet non trouvé' })
    }
    
    await prisma.itemPrice.delete({
      where: {
        itemId_cityName: {
          itemId: item.id,
          cityName: cityName
        }
      }
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du prix:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Route pour obtenir toutes les villes
app.get('/api/cities', async (req, res) => {
  try {
    const result = await prisma.itemPrice.findMany({
      select: {
        cityName: true
      },
      distinct: ['cityName']
    })
    
    const cities = result.map(r => r.cityName).sort()
    res.json(cities)
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Erreur interne du serveur' })
})

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' })
})

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu, arrêt du serveur...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('Serveur arrêté')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT reçu, arrêt du serveur...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('Serveur arrêté')
    process.exit(0)
  })
})