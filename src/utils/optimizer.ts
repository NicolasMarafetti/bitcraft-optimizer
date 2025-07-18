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

  const recommendationsWithAllPrices: CraftingRecommendation[] = []
  const recommendationsWithMissingPrices: CraftingRecommendation[] = []
  const recommendationsWithPriceOne: CraftingRecommendation[] = []

  for (const item of craftableItems) {
    const materials = await calculateMaterialsCost(item.craftingCost!, cityName)
    const materialsWithEstimatedPrices = await calculateMaterialsCostWithEstimation(item.craftingCost!, cityName)

    // Si tous les prix sont disponibles, utiliser la liste principale
    if (materials.length > 0) {
      const recommendation = await createCraftingRecommendation(item, materials, cityName)
      if (recommendation) {
        if (recommendation.suggestedPrice === 1) {
          recommendationsWithPriceOne.push(recommendation)
        } else {
          recommendationsWithAllPrices.push(recommendation)
        }
      }
    }
    // Sinon, utiliser les prix estimés pour la liste secondaire
    else if (materialsWithEstimatedPrices.length > 0) {
      const recommendation = await createCraftingRecommendation(item, materialsWithEstimatedPrices, cityName)
      if (recommendation) {
        if (recommendation.suggestedPrice === 1) {
          recommendationsWithPriceOne.push(recommendation)
        } else {
          recommendationsWithMissingPrices.push(recommendation)
        }
      }
    }
  }

  // Fonction de tri personnalisée : bénéfice >20% par prix croissant, puis le reste par marge décroissante
  const customSort = (a: CraftingRecommendation, b: CraftingRecommendation) => {
    const aHighMargin = a.profitMargin >= 20
    const bHighMargin = b.profitMargin >= 20

    // Si les deux ont >20% de marge, trier par prix de vente croissant
    if (aHighMargin && bHighMargin) {
      return a.suggestedPrice - b.suggestedPrice
    }

    // Prioriser ceux avec >20% de marge
    if (aHighMargin && !bHighMargin) {
      return -1
    }
    if (!aHighMargin && bHighMargin) {
      return 1
    }

    // Pour le reste, trier par marge décroissante
    return b.profitMargin - a.profitMargin
  }

  // Appliquer le tri personnalisé à chaque liste
  recommendationsWithAllPrices.sort(customSort)
  recommendationsWithMissingPrices.sort(customSort)
  recommendationsWithPriceOne.sort(customSort)

  // Retourner d'abord celles avec tous les prix, puis celles avec prix manquants, puis celles avec prix à 1
  return [...recommendationsWithAllPrices, ...recommendationsWithMissingPrices, ...recommendationsWithPriceOne]
}

export const calculateMaterialsCost = async (craftingCost: any[], cityName: string): Promise<CraftingMaterial[]> => {
  const materials: CraftingMaterial[] = []

  for (const cost of craftingCost) {
    const item = await getItemById(cost.itemId)
    if (!item) continue

    const price = getItemPriceSync(cost.itemId, cityName)
    if (price === null) return [] // Retourner tableau vide si un prix manque

    materials.push({
      item,
      quantity: cost.quantity,
      cost: price * cost.quantity
    })
  }

  return materials
}

export const calculateMaterialsCostWithEstimation = async (craftingCost: any[], cityName: string): Promise<CraftingMaterial[]> => {
  const materials: CraftingMaterial[] = []

  for (const cost of craftingCost) {
    const item = await getItemById(cost.itemId)
    if (!item) continue

    let price = getItemPriceSync(cost.itemId, cityName)
    if (price === null) price = 1; // Prix estimé à 1 si non disponible

    materials.push({
      item,
      quantity: cost.quantity,
      cost: price * cost.quantity
    })
  }

  return materials
}

export const createCraftingRecommendation = async (item: any, materials: CraftingMaterial[], cityName: string): Promise<CraftingRecommendation | null> => {
  const totalCost = materials.reduce((sum: number, material: CraftingMaterial) => sum + material.cost, 0)

  // Calculer les revenus des outputs
  const outputs = item.craftingOutputs || [{ itemId: item.id, quantity: 1 }]
  let totalRevenue = 0

  // Calculer le prix de vente suggéré avec marge limitée à 20%
  let suggestedPrice: number = 0;
  const maxPriceWithMargin = Math.ceil(totalCost * MAX_PROFIT_MARGIN)

  for (const output of outputs) {
    const outputPrice = getItemPriceSync(output.itemId, cityName)

    if (outputPrice) {
      // J'aimerai que le prix de vente suggéré soit 10% en dessous du prix de vente actuel. Arrondi au chiffre supérieur. Mais qui ne doit pas être égal au chiffre de vente actuel
      suggestedPrice = Math.ceil(outputPrice * UNDERCUT_PERCENTAGE)
      if (suggestedPrice > 1 && suggestedPrice >= outputPrice) {
        suggestedPrice = outputPrice - 1
      }
      // Limiter le prix suggéré à la marge maximale de 20%
      suggestedPrice = Math.min(suggestedPrice, maxPriceWithMargin)
    }
  }

  if (!suggestedPrice) suggestedPrice = Math.ceil(maxPriceWithMargin / outputs[0].quantity);

  for (const output of outputs) {
    totalRevenue += suggestedPrice * output.quantity
  }

  const profitPerCraft = totalRevenue - totalCost
  const profitMargin = totalCost > 0 ? (profitPerCraft / totalCost) * 100 : 0

  return {
    item,
    profitPerCraft,
    craftingCost: totalCost,
    materials,
    profitMargin,
    suggestedPrice
  }
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