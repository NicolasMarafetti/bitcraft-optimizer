import { FarmingRecommendation, CraftingRecommendation, CraftingMaterial } from '../types'
import { loadBitCraftItems, getItemById } from './dataLoader'
import { getItemPriceSync } from './priceManager'

// Constants pour les calculs de prix
const UNDERCUT_PERCENTAGE = 0.9 // 10% de reduction sur le prix existant
const MAX_PROFIT_MARGIN = 1.2 // 20% de marge maximum sur le coût des matériaux

export const calculateFarmingRecommendations = async (cityName: string): Promise<FarmingRecommendation[]> => {
  const items = await loadBitCraftItems()

  const recommendations: FarmingRecommendation[] = []

  for (const item of items) {
    const price = getItemPriceSync(item.id, cityName)
    if (price === null) continue

    let farmingTime = item.farmingTime || 1;
    const profitPerHour = price ? (price / (farmingTime / 60)) : 9999; // Convertir minutes en heures

    recommendations.push({
      item,
      profitPerHour,
      farmingTime: item.farmingTime!,
      difficulty: getDifficultyFromFarmingTime(item.farmingTime!)
    })
  }

  return recommendations.sort((a, b) => b.profitPerHour - a.profitPerHour)
}

export const calculateCraftingRecommendations = async (cityName: string): Promise<CraftingRecommendation[]> => {
  const items = await loadBitCraftItems()

  const craftableItems = items.filter((item: any) =>
    item.craftingCost &&
    item.craftingCost.length > 0
  )

  const recommendations: CraftingRecommendation[] = []

  for (const item of craftableItems) {
    const itemPrice = getItemPriceSync(item.id, cityName)

    const materials = await calculateMaterialsCost(item.craftingCost!, cityName)
    if (materials.length === 0) continue // Impossible de calculer si prix des matériaux manquants

    const totalCost = materials.reduce((sum: number, material: CraftingMaterial) => sum + material.cost, 0)
    
    // Calculer le prix de vente suggéré avec marge limitée à 20%
    let suggestedPrice: number
    const maxPriceWithMargin = Math.ceil(totalCost * MAX_PROFIT_MARGIN)
    
    
    if (itemPrice) {
      // Si l'objet a un prix, undercut selon le pourcentage défini mais limité à 20% de marge
      const undercutPrice = Math.ceil(itemPrice * UNDERCUT_PERCENTAGE)
      suggestedPrice = Math.min(undercutPrice, maxPriceWithMargin)
    } else {
      // Si l'objet n'a pas de prix, vendre avec 20% de marge maximum
      suggestedPrice = maxPriceWithMargin
    }
    
    const profitPerCraft = suggestedPrice - totalCost
    const profitMargin = totalCost > 0 ? (profitPerCraft / totalCost) * 100 : 0

    recommendations.push({
      item,
      profitPerCraft,
      craftingCost: totalCost,
      materials,
      profitMargin,
      suggestedPrice
    })
  }

  return recommendations
    .filter(rec => rec.profitMargin > 0) // Seulement les crafts rentables
    .sort((a, b) => b.profitMargin - a.profitMargin)
}

export const calculateMaterialsCost = async (craftingCost: any[], cityName: string): Promise<CraftingMaterial[]> => {
  const materials: CraftingMaterial[] = []

  for (const cost of craftingCost) {
    const item = await getItemById(cost.itemId)
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

export const getBestFarmingOption = async (cityName: string): Promise<FarmingRecommendation | null> => {
  const recommendations = await calculateFarmingRecommendations(cityName)
  return recommendations.length > 0 ? recommendations[0] : null
}

export const getBestCraftingOption = async (cityName: string): Promise<CraftingRecommendation | null> => {
  const recommendations = await calculateCraftingRecommendations(cityName)
  return recommendations.length > 0 ? recommendations[0] : null
}

export const getOptimizationSummary = async (cityName: string) => {
  const items = await loadBitCraftItems()
  const farmingRecommendations = await calculateFarmingRecommendations(cityName)
  const craftingRecommendations = await calculateCraftingRecommendations(cityName)

  return {
    totalItems: items.length,
    farmableItems: items.filter(item => item.type === 'resource' && item.farmingTime).length,
    craftableItems: items.filter(item => item.craftingCost && item.craftingCost.length > 0).length,
    farmingRecommendations: farmingRecommendations.length,
    craftingRecommendations: craftingRecommendations.length,
    bestFarming: await getBestFarmingOption(cityName),
    bestCrafting: await getBestCraftingOption(cityName)
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