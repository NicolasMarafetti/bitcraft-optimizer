import { BitCraftItem, FarmingRecommendation, CraftingRecommendation, CraftingMaterial } from '../types'
import { loadBitCraftItems, getItemById } from './dataLoader'
import { getItemPriceSync } from './priceManager'

export const calculateFarmingRecommendations = (cityName: string): FarmingRecommendation[] => {
  const items = loadBitCraftItems()
  const farmableItems = items.filter(item => 
    item.type === 'resource' && 
    item.farmingTime && 
    item.farmingTime > 0
  )
  
  const recommendations: FarmingRecommendation[] = []
  
  farmableItems.forEach(item => {
    const price = getItemPriceSync(item.id, cityName)
    if (price === null) return
    
    const profitPerHour = (price / (item.farmingTime! / 60)) // Convertir minutes en heures
    
    recommendations.push({
      item,
      profitPerHour,
      farmingTime: item.farmingTime!,
      difficulty: getDifficultyFromFarmingTime(item.farmingTime!)
    })
  })
  
  return recommendations.sort((a, b) => b.profitPerHour - a.profitPerHour)
}

export const calculateCraftingRecommendations = (cityName: string): CraftingRecommendation[] => {
  const items = loadBitCraftItems()
  const craftableItems = items.filter(item => 
    item.craftingCost && 
    item.craftingCost.length > 0
  )
  
  const recommendations: CraftingRecommendation[] = []
  
  craftableItems.forEach(item => {
    const itemPrice = getItemPriceSync(item.id, cityName)
    if (itemPrice === null) return
    
    const materials = calculateMaterialsCost(item.craftingCost!, cityName)
    if (materials.length === 0) return // Impossible de calculer si prix des matériaux manquants
    
    const totalCost = materials.reduce((sum, material) => sum + material.cost, 0)
    const profitPerCraft = itemPrice - totalCost
    const profitMargin = totalCost > 0 ? (profitPerCraft / totalCost) * 100 : 0
    
    recommendations.push({
      item,
      profitPerCraft,
      craftingCost: totalCost,
      materials,
      profitMargin
    })
  })
  
  return recommendations
    .filter(rec => rec.profitPerCraft > 0) // Seulement les crafts rentables
    .sort((a, b) => b.profitPerCraft - a.profitPerCraft)
}

export const calculateMaterialsCost = (craftingCost: any[], cityName: string): CraftingMaterial[] => {
  const materials: CraftingMaterial[] = []
  
  for (const cost of craftingCost) {
    const item = getItemById(cost.itemId)
    if (!item) continue
    
    const price = getItemPriceSync(cost.itemId, cityName)
    if (price === null) continue // Retourner un tableau vide si un prix manque
    
    materials.push({
      item,
      quantity: cost.quantity,
      cost: price * cost.quantity
    })
  }
  
  // Retourner un tableau vide si tous les prix ne sont pas disponibles
  if (materials.length !== craftingCost.length) {
    return []
  }
  
  return materials
}

export const getBestFarmingOption = (cityName: string): FarmingRecommendation | null => {
  const recommendations = calculateFarmingRecommendations(cityName)
  return recommendations.length > 0 ? recommendations[0] : null
}

export const getBestCraftingOption = (cityName: string): CraftingRecommendation | null => {
  const recommendations = calculateCraftingRecommendations(cityName)
  return recommendations.length > 0 ? recommendations[0] : null
}

export const getOptimizationSummary = (cityName: string) => {
  const items = loadBitCraftItems()
  const farmingRecommendations = calculateFarmingRecommendations(cityName)
  const craftingRecommendations = calculateCraftingRecommendations(cityName)
  
  return {
    totalItems: items.length,
    farmableItems: items.filter(item => item.type === 'resource' && item.farmingTime).length,
    craftableItems: items.filter(item => item.craftingCost && item.craftingCost.length > 0).length,
    farmingRecommendations: farmingRecommendations.length,
    craftingRecommendations: craftingRecommendations.length,
    bestFarming: getBestFarmingOption(cityName),
    bestCrafting: getBestCraftingOption(cityName)
  }
}

const getDifficultyFromFarmingTime = (farmingTime: number): 'easy' | 'medium' | 'hard' => {
  if (farmingTime <= 1) return 'easy'
  if (farmingTime <= 3) return 'medium'
  return 'hard'
}

export const formatProfitPerHour = (profitPerHour: number): string => {
  return `${Math.round(profitPerHour)} pièces/h`
}

export const formatProfit = (profit: number): string => {
  return `${Math.round(profit)} pièces`
}

export const formatProfitMargin = (margin: number): string => {
  return `${Math.round(margin)}%`
}