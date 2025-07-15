import { ItemPrice } from '../types'
import { api } from '../lib/api'
import { getItemById } from './dataLoader'

// Pour maintenir la compatibilité, nous gardons les mêmes signatures de fonctions
// mais nous utilisons maintenant la base de données au lieu du localStorage

export const addPrice = async (itemId: string, price: number, cityName: string): Promise<ItemPrice | null> => {
  try {
    const item = await getItemById(itemId)
    if (!item) {
      console.error('Objet non trouvé:', itemId)
      return null
    }

    const apiPrice = await api.setItemPrice(item.name, price, cityName)

    // Mettre à jour le cache immédiatement
    const cacheKey = `${itemId}_${cityName}`
    priceCache.set(cacheKey, apiPrice.price)
    
    // Invalider le cache pour forcer un refresh complet au prochain accès
    lastCacheUpdate = 0

    return {
      id: apiPrice.id,
      itemId: itemId,
      price: apiPrice.price,
      cityName: apiPrice.cityName,
      lastUpdated: new Date(apiPrice.lastUpdated)
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du prix:', error)
    return null
  }
}

export const removePrice = async (itemId: string, cityName: string): Promise<boolean> => {
  try {
    const item = await getItemById(itemId)
    if (!item) return false

    const result = await api.removeItemPrice(cityName, item.name)
    
    if (result.success) {
      // Mettre à jour le cache immédiatement
      const cacheKey = `${itemId}_${cityName}`
      priceCache.delete(cacheKey)
      
      // Invalider le cache pour forcer un refresh complet au prochain accès
      lastCacheUpdate = 0
    }
    
    return result.success
  } catch (error) {
    console.error('Erreur lors de la suppression du prix:', error)
    return false
  }
}

export const getItemPrice = async (itemId: string, cityName: string): Promise<number | null> => {
  try {
    const item = await getItemById(itemId)
    if (!item) return null

    const result = await api.getItemPrice(cityName, item.name)
    return result.price
  } catch (error) {
    console.error('Erreur lors de la récupération du prix:', error)
    return null
  }
}

export const getAllPricesForCity = async (cityName: string): Promise<ItemPrice[]> => {
  try {
    const apiPrices = await api.getPricesForCity(cityName)
    
    return apiPrices.map(apiPrice => ({
      id: apiPrice.id,
      itemId: apiPrice.item!.id,
      price: apiPrice.price,
      cityName: apiPrice.cityName,
      lastUpdated: new Date(apiPrice.lastUpdated)
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error)
    return []
  }
}

export const getCities = async (): Promise<string[]> => {
  try {
    return await api.getCities()
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error)
    return []
  }
}

export const getItemsWithPrices = async (cityName: string): Promise<string[]> => {
  try {
    const prices = await getAllPricesForCity(cityName)
    return prices.map(price => price.itemId)
  } catch (error) {
    console.error('Erreur lors de la récupération des objets avec prix:', error)
    return []
  }
}

// Fonctions de compatibilité synchrones (pour les composants qui ne peuvent pas être async)
// Ces fonctions utilisent un cache local temporaire

let priceCache: Map<string, number> = new Map()
let lastCacheUpdate = 0
let isRefreshing = false
const CACHE_DURATION = 30000 // 30 secondes

export const getItemPriceSync = (itemId: string, cityName: string): number | null => {
  const cacheKey = `${itemId}_${cityName}`
  const cachedPrice = priceCache.get(cacheKey) || null

  if (Date.now() - lastCacheUpdate > CACHE_DURATION && !isRefreshing) {
    // Cache expiré, mais on retourne quand même la valeur mise en cache si elle existe
    // Une mise à jour async sera déclenchée en arrière-plan
    refreshPriceCache(cityName)
  }

  return cachedPrice;
}

export const refreshPriceCache = async (cityName: string) => {
  if (isRefreshing) return
  
  try {
    isRefreshing = true
    const prices = await getAllPricesForCity(cityName)
    priceCache.clear()

    prices.forEach(price => {
      const cacheKey = `${price.itemId}_${price.cityName}`
      priceCache.set(cacheKey, price.price)
    })

    lastCacheUpdate = Date.now()
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cache:', error)
  } finally {
    isRefreshing = false
  }
}

// Fonctions utilitaires
export const updatePrice = async (itemId: string, newPrice: number, cityName: string): Promise<boolean> => {
  const result = await addPrice(itemId, newPrice, cityName)
  return result !== null
}

// Fonction d'initialisation à appeler au démarrage de l'application
export const initializePriceManager = async (cityName: string = 'Ma Ville') => {
  await refreshPriceCache(cityName)
}