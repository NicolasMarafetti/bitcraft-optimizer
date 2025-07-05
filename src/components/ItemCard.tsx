import { useState } from 'react'
import { BitCraftItem } from '../types'
import { getItemPriceSync } from '../utils/priceManager'

interface ItemCardProps {
  item: BitCraftItem
  cityName: string
  onSetPrice?: (itemId: string) => void
  onDeleteItem?: (itemId: string) => void
}

export default function ItemCard({ item, cityName, onSetPrice, onDeleteItem }: ItemCardProps) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const price = getItemPriceSync(item.id, cityName)
  
  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(item.name)
      setCopyFeedback('Copié !')
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
      setCopyFeedback('Erreur')
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }
  const typeColors = {
    resource: 'bg-green-100 text-green-800',
    crafted: 'bg-blue-100 text-blue-800',
    tool: 'bg-purple-100 text-purple-800',
    equipment: 'bg-orange-100 text-orange-800'
  }
  
  const rarityColors = {
    common: 'border-gray-300',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  }
  
  return (
    <div className={`bg-white rounded-lg p-4 border-2 ${rarityColors[item.rarity || 'common']} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <h3 className="font-semibold text-bitcraft-dark text-lg">{item.name}</h3>
          <button
            onClick={handleCopyName}
            className="text-gray-400 hover:text-bitcraft-primary transition-colors p-1 rounded"
            title="Copier le nom pour recherche dans le jeu"
          >
            {copyFeedback ? (
              <span className="text-xs text-green-600 font-medium">{copyFeedback}</span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type as keyof typeof typeColors]}`}>
            Tier {item.tier}
          </span>
          {onDeleteItem && (
            <button
              onClick={() => onDeleteItem(item.id)}
              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
              title="Supprimer cet objet"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {item.description && (
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Type:</span>
          <span className="font-medium capitalize">{item.type}</span>
        </div>
        
        {item.farmingTime && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Temps de récolte:</span>
            <span className="font-medium">{item.farmingTime} min</span>
          </div>
        )}
        
        {item.craftingTime && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Temps de craft:</span>
            <span className="font-medium">{item.craftingTime} min</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-medium text-gray-700">Prix:</span>
          <div className="flex items-center space-x-2">
            {price !== null ? (
              <span className="text-bitcraft-primary font-semibold">{price} pièces</span>
            ) : (
              <span className="text-gray-400">Non défini</span>
            )}
            {onSetPrice && (
              <button
                onClick={() => onSetPrice(item.id)}
                className="text-bitcraft-secondary hover:text-bitcraft-primary text-sm font-medium transition-colors"
              >
                {price !== null ? 'Modifier' : 'Définir'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}