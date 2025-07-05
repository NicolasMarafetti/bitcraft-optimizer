import { prisma } from './prisma'
import { BitCraftItem, ItemPrice } from '../types'
import { loadBitCraftItems } from '../utils/dataLoader'

// Initialiser la base de données avec les objets BitCraft
export async function initializeDatabase() {
  try {
    console.log('Initialisation de la base de données...')
    
    const items = loadBitCraftItems()
    
    // Insérer ou mettre à jour les objets
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
    }
    
    console.log(`${items.length} objets initialisés en base de données`)
    return true
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error)
    return false
  }
}

// Fonctions pour gérer les prix
export async function addItemPrice(itemName: string, price: number, cityName: string) {
  try {
    // Trouver l'objet par son nom
    const item = await prisma.bitCraftItem.findUnique({
      where: { name: itemName }
    })
    
    if (!item) {
      throw new Error(`Objet ${itemName} non trouvé`)
    }
    
    // Créer ou mettre à jour le prix
    const itemPrice = await prisma.itemPrice.upsert({
      where: {
        itemId_cityName: {
          itemId: item.id,
          cityName: cityName
        }
      },
      update: {
        price: price,
        lastUpdated: new Date()
      },
      create: {
        itemId: item.id,
        price: price,
        cityName: cityName,
        lastUpdated: new Date()
      }
    })
    
    return itemPrice
  } catch (error) {
    console.error('Erreur lors de l\'ajout du prix:', error)
    throw error
  }
}

export async function getItemPrice(itemName: string, cityName: string): Promise<number | null> {
  try {
    const item = await prisma.bitCraftItem.findUnique({
      where: { name: itemName }
    })
    
    if (!item) return null
    
    const price = await prisma.itemPrice.findUnique({
      where: {
        itemId_cityName: {
          itemId: item.id,
          cityName: cityName
        }
      }
    })
    
    return price ? price.price : null
  } catch (error) {
    console.error('Erreur lors de la récupération du prix:', error)
    return null
  }
}

export async function getAllPricesForCity(cityName: string) {
  try {
    const prices = await prisma.itemPrice.findMany({
      where: { cityName },
      include: {
        item: true
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    })
    
    return prices
  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error)
    return []
  }
}

export async function removeItemPrice(itemName: string, cityName: string) {
  try {
    const item = await prisma.bitCraftItem.findUnique({
      where: { name: itemName }
    })
    
    if (!item) return false
    
    await prisma.itemPrice.delete({
      where: {
        itemId_cityName: {
          itemId: item.id,
          cityName: cityName
        }
      }
    })
    
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression du prix:', error)
    return false
  }
}

export async function getCities(): Promise<string[]> {
  try {
    const result = await prisma.itemPrice.findMany({
      select: {
        cityName: true
      },
      distinct: ['cityName']
    })
    
    return result.map(r => r.cityName).sort()
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error)
    return []
  }
}

export async function getItemsWithPrices(cityName: string): Promise<string[]> {
  try {
    const prices = await prisma.itemPrice.findMany({
      where: { cityName },
      include: {
        item: true
      }
    })
    
    return prices.map(p => p.item.name)
  } catch (error) {
    console.error('Erreur lors de la récupération des objets avec prix:', error)
    return []
  }
}

// Fonctions utilitaires
export async function disconnectDatabase() {
  await prisma.$disconnect()
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    console.log('Connexion à la base de données réussie')
    return true
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error)
    return false
  }
}