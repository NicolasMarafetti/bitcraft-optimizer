import { useState, useEffect } from 'react'
import { useCity } from '../contexts/CityContext'
import { getOptimizationSummary, calculateFarmingRecommendations, calculateCraftingRecommendations, formatProfitPerHour, formatProfit, formatProfitMargin } from '../utils/optimizer'
import { FarmingRecommendation, CraftingRecommendation, BitCraftItem } from '../types'
import { addPrice } from '../utils/priceManager'
import { loadBitCraftItems } from '../utils/dataLoader'

export default function Recommendations() {
  const { selectedCity } = useCity()
  const [farmingRecommendations, setFarmingRecommendations] = useState<FarmingRecommendation[]>([])
  const [craftingRecommendations, setCraftingRecommendations] = useState<CraftingRecommendation[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [updatingPrices, setUpdatingPrices] = useState<Set<string>>(new Set())
  const [items, setItems] = useState<BitCraftItem[]>([])

  useEffect(() => {
    const updateRecommendations = async () => {
      const allItems = await loadBitCraftItems()
      const farmingRecs = await calculateFarmingRecommendations(selectedCity)
      const craftingRecs = await calculateCraftingRecommendations(selectedCity)
      const optimizationSummary = await getOptimizationSummary(selectedCity)

      setItems(allItems)
      setFarmingRecommendations(farmingRecs)
      setCraftingRecommendations(craftingRecs)
      setSummary(optimizationSummary)
    }

    updateRecommendations()
  }, [selectedCity])

  const handleSetSaleOrder = async (recommendation: CraftingRecommendation) => {
    const itemId = recommendation.item.id
    setUpdatingPrices(prev => new Set(prev).add(itemId))

    try {
      const success = await addPrice(itemId, recommendation.suggestedPrice, selectedCity)
      if (success) {
        // Recharger les recommandations pour refléter le nouveau prix
        const allItems = await loadBitCraftItems()
        const farmingRecs = await calculateFarmingRecommendations(selectedCity)
        const craftingRecs = await calculateCraftingRecommendations(selectedCity)
        const optimizationSummary = await getOptimizationSummary(selectedCity)

        setItems(allItems)
        setFarmingRecommendations(farmingRecs)
        setCraftingRecommendations(craftingRecs)
        setSummary(optimizationSummary)
      }
    } catch (error) {
      console.error('Error setting sale order:', error)
    } finally {
      setUpdatingPrices(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Recommandations
        </h1>
        <p className="text-gray-300">
          Découvrez les meilleures opportunités de farming et de crafting
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
            🌾 Meilleur Farming
          </h2>
          <div className="space-y-3">
            {farmingRecommendations.length > 0 ? (
              farmingRecommendations.slice(0, 3).map((rec, index) => (
                <div key={rec.item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-bitcraft-dark">{rec.item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Tier {rec.item.tier} • Temps: {rec.farmingTime}min
                        {index === 0 && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">🏆 Meilleur</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-bitcraft-secondary">
                        {formatProfitPerHour(rec.profitPerHour)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Profit par heure
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center mt-4 text-gray-500">
                <p>Aucune ressource farmable trouvée avec prix renseigné</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
            🔨 Meilleur Crafting
          </h2>
          <div className="space-y-3">
            {craftingRecommendations.length > 0 ? (
              craftingRecommendations.map((rec, index) => {
                const isLowMargin = rec.profitMargin < 20
                return (
                  <div key={rec.item.id} className={`p-4 rounded-lg border ${isLowMargin
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-bitcraft-dark">{rec.item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Tier {rec.item.tier} • Coût total: {formatProfit(rec.craftingCost)}
                          {index === 0 && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">🏆 Meilleur</span>}
                          {isLowMargin && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">⚠️ Faible marge</span>}
                        </p>
                        {rec.item.craftingTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            ⏱️ Temps de craft: {rec.item.craftingTime}min
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${isLowMargin ? 'text-orange-600' : 'text-bitcraft-accent'
                          }`}>
                          +{formatProfitMargin(rec.profitMargin)}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          Marge bénéficiaire
                        </div>
                        <div className="text-sm text-green-600 font-medium mb-2">
                          Revenu total: {formatProfit(rec.suggestedPrice * (rec.item.craftingOutputs?.[0]?.quantity || 1))}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          Profit: {formatProfit(rec.profitPerCraft)}
                        </div>
                        <button
                          onClick={() => handleSetSaleOrder(rec)}
                          disabled={updatingPrices.has(rec.item.id)}
                          className={`text-xs px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLowMargin
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                        >
                          {updatingPrices.has(rec.item.id) ? '⏳' : '📋 Ordre mis'}
                        </button>
                      </div>
                    </div>

                    {/* Liste des ingrédients */}
                    <div className="border-t pt-3 mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">📦 Ingrédients requis:</h4>
                      <div className="space-y-1">
                        {rec.materials.map((material, materialIndex) => (
                          <div key={materialIndex} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              {material.quantity}x {material.item.name}
                            </span>
                            <span className="text-gray-500 font-medium">
                              {formatProfit(material.cost)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-gray-100 mt-2">
                        <span className="text-gray-700">Total matériaux:</span>
                        <span className="text-gray-800">{formatProfit(rec.craftingCost)}</span>
                      </div>
                    </div>

                    {/* Liste des outputs produits */}
                    {rec.item.craftingOutputs && rec.item.craftingOutputs.length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Objets produits:</h4>
                        <div className="space-y-1">
                          {rec.item.craftingOutputs.map((output, outputIndex) => {
                            const outputItem = items.find(item => item.id === output.itemId)

                            return (
                              <div key={outputIndex} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                  {output.quantity}x {outputItem?.name || 'Objet inconnu'}
                                </span>
                                <span className="text-gray-500 font-medium">
                                  {rec.suggestedPrice ? `${output.quantity}x ${rec.suggestedPrice} = ${formatProfit(rec.suggestedPrice * output.quantity)}` : 'Prix non défini'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center mt-4 text-gray-500">
                <p>Aucun craft rentable trouvé. Les recettes de craft ne sont pas encore définies.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
          📊 Analyse détaillée
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-bitcraft-primary">
              {summary?.totalItems || 0}
            </div>
            <div className="text-sm text-gray-600">Objets analysés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-bitcraft-secondary">
              {farmingRecommendations.length + craftingRecommendations.length}
            </div>
            <div className="text-sm text-gray-600">Avec prix définis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-bitcraft-accent">
              {farmingRecommendations.length + craftingRecommendations.length}
            </div>
            <div className="text-sm text-gray-600">Recommandations</div>
          </div>
        </div>

        {summary?.bestFarming && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🏆 Meilleure option farming</h3>
            <p className="text-green-700">
              <strong>{summary.bestFarming.item.name}</strong> - {formatProfitPerHour(summary.bestFarming.profitPerHour)}
            </p>
          </div>
        )}

        {summary?.bestCrafting && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🏆 Meilleure option crafting</h3>
            <p className="text-blue-700">
              <strong>{summary.bestCrafting.item.name}</strong> - +{formatProfit(summary.bestCrafting.profitPerCraft)} par craft
            </p>
          </div>
        )}
      </div>
    </div>
  )
}