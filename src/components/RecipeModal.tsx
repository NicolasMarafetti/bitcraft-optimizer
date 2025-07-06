import { useState, useEffect } from 'react'
import { BitCraftItem, CraftingCost } from '../types'
import { api } from '../lib/api'
import { loadBitCraftItems, invalidateItemsCache } from '../utils/dataLoader'

interface RecipeModalProps {
  item: BitCraftItem
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

interface MaterialInput {
  itemId: string
  quantity: number
}

export default function RecipeModal({ item, isOpen, onClose, onSave }: RecipeModalProps) {
  const [materials, setMaterials] = useState<MaterialInput[]>([])
  const [availableItems, setAvailableItems] = useState<BitCraftItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, item.id])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Charger les objets disponibles
      const items = await loadBitCraftItems()
      setAvailableItems(items.filter(i => i.id !== item.id)) // Exclure l'objet actuel

      // Charger la recette existante
      const recipe = await api.getItemRecipe(item.id)
      if (recipe.materials && recipe.materials.length > 0) {
        setMaterials(recipe.materials.map(m => ({
          itemId: m.itemId,
          quantity: m.quantity
        })))
      } else {
        setMaterials([{ itemId: '', quantity: 1 }])
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error('Error loading recipe data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const addMaterial = () => {
    setMaterials([...materials, { itemId: '', quantity: 1 }])
  }

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const updateMaterial = (index: number, field: keyof MaterialInput, value: string | number) => {
    const updatedMaterials = materials.map((material, i) => {
      if (i === index) {
        return { ...material, [field]: value }
      }
      return material
    })
    setMaterials(updatedMaterials)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const validMaterials = materials.filter(m => m.itemId && m.quantity > 0)
      
      if (validMaterials.length === 0) {
        // Supprimer la recette si aucun matériau
        await api.removeItemRecipe(item.id)
      } else {
        // Sauvegarder la recette
        await api.setItemRecipe(item.id, validMaterials)
      }
      
      // Invalider le cache pour forcer le rechargement des recettes
      invalidateItemsCache()
      
      onSave()
      onClose()
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
      console.error('Error saving recipe:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getItemName = (itemId: string) => {
    const foundItem = availableItems.find(i => i.id === itemId)
    return foundItem ? foundItem.name : 'Objet inconnu'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Recette de craft - {item.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Matériaux nécessaires
            </h3>
            
            {materials.map((material, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <select
                  value={material.itemId}
                  onChange={(e) => updateMaterial(index, 'itemId', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary"
                  disabled={isLoading}
                >
                  <option value="">Sélectionner un objet</option>
                  {availableItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Tier {item.tier})
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  min="1"
                  value={material.quantity}
                  onChange={(e) => updateMaterial(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary"
                  disabled={isLoading}
                />
                
                <button
                  onClick={() => removeMaterial(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              onClick={addMaterial}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-bitcraft-primary hover:text-bitcraft-primary focus:outline-none focus:ring-2 focus:ring-bitcraft-primary"
              disabled={isLoading}
            >
              + Ajouter un matériau
            </button>
          </div>

          {materials.length > 0 && materials.some(m => m.itemId) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-700">Aperçu de la recette :</h4>
              <ul className="space-y-1">
                {materials.filter(m => m.itemId && m.quantity > 0).map((material, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {material.quantity}x {getItemName(material.itemId)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-bitcraft-primary text-white rounded-md hover:bg-bitcraft-secondary focus:outline-none focus:ring-2 focus:ring-bitcraft-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}