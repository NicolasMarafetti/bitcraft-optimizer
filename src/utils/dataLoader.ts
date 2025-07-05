import { BitCraftItem, CraftingCost } from '../types'
import { api } from '../lib/api'

export const loadBitCraftItems = async (): Promise<BitCraftItem[]> => {
  try {
    const items = await api.getItems()
    
    return items.map(item => ({
      id: item.id,
      name: item.name,
      tier: item.tier,
      type: item.type as 'resource' | 'crafted' | 'tool' | 'equipment',
      description: item.description || undefined,
      rarity: item.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | undefined,
      imageUrl: item.imageUrl || undefined,
      farmingTime: item.farmingTime || undefined,
      craftingTime: item.craftingTime || undefined,
      craftingCost: [] // Will be populated by getCraftingCost if needed
    }))
  } catch (error) {
    console.error('Error loading BitCraft items:', error)
    return []
  }
}

// Cache for items to avoid repeated API calls
let itemsCache: BitCraftItem[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const getItemsFromCache = async (): Promise<BitCraftItem[]> => {
  if (itemsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return itemsCache
  }
  
  try {
    const items = await api.getItems()
    itemsCache = items.map(item => ({
      id: item.id,
      name: item.name,
      tier: item.tier,
      type: item.type as 'resource' | 'crafted' | 'tool' | 'equipment',
      description: item.description || undefined,
      rarity: item.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | undefined,
      imageUrl: item.imageUrl || undefined,
      farmingTime: item.farmingTime || undefined,
      craftingTime: item.craftingTime || undefined,
      craftingCost: [] // Will need to be populated from static data or additional API calls
    }))
    cacheTimestamp = Date.now()
    return itemsCache
  } catch (error) {
    console.error('Error loading items from API:', error)
    return []
  }
}

export const getCraftingCost = async (_itemId: string): Promise<CraftingCost[]> => {
  // For now, return empty array since crafting costs aren't available via API
  // This would need to be implemented in the server API
  return []
}

export const getItemById = async (itemId: string): Promise<BitCraftItem | undefined> => {
  try {
    const items = await getItemsFromCache()
    return items.find(item => item.id === itemId)
  } catch (error) {
    console.error('Error getting item by ID:', error)
    return undefined
  }
}

export const getItemsByType = async (type: string): Promise<BitCraftItem[]> => {
  try {
    const items = await getItemsFromCache()
    return items.filter(item => item.type === type)
  } catch (error) {
    console.error('Error getting items by type:', error)
    return []
  }
}

export const getResourceItems = async (): Promise<BitCraftItem[]> => {
  return getItemsByType('resource')
}

export const getCraftableItems = async (): Promise<BitCraftItem[]> => {
  try {
    const items = await getItemsFromCache()
    return items.filter(item => 
      item.type === 'crafted' || item.type === 'tool' || item.type === 'equipment'
    )
  } catch (error) {
    console.error('Error getting craftable items:', error)
    return []
  }
}

export const searchItems = async (query: string): Promise<BitCraftItem[]> => {
  try {
    const items = await getItemsFromCache()
    const lowerQuery = query.toLowerCase()
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    )
  } catch (error) {
    console.error('Error searching items:', error)
    return []
  }
}

export const createItem = async (item: { name: string; tier: number; imageUrl?: string }): Promise<BitCraftItem | null> => {
  try {
    const newItem = await api.createItem(item)
    
    // Invalider le cache pour forcer le rechargement
    itemsCache = null
    
    return {
      id: newItem.id,
      name: newItem.name,
      tier: newItem.tier,
      type: newItem.type as 'resource' | 'crafted' | 'tool' | 'equipment',
      description: newItem.description,
      rarity: newItem.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | undefined,
      imageUrl: newItem.imageUrl,
      farmingTime: newItem.farmingTime,
      craftingTime: newItem.craftingTime,
      craftingCost: []
    }
  } catch (error) {
    console.error('Error creating item:', error)
    return null
  }
}

export const deleteItem = async (itemId: string): Promise<boolean> => {
  try {
    const result = await api.deleteItem(itemId)
    
    // Invalider le cache pour forcer le rechargement
    itemsCache = null
    
    return result.success
  } catch (error) {
    console.error('Error deleting item:', error)
    return false
  }
}