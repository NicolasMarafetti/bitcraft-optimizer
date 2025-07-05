import { useState, useEffect } from 'react'
import { BitCraftItem } from '../types'
import { addPrice, getItemPriceSync, refreshPriceCache } from '../utils/priceManager'

interface PriceModalProps {
  item: BitCraftItem | null
  cityName: string
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function PriceModal({ item, cityName, isOpen, onClose, onSave }: PriceModalProps) {
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (item) {
      const currentPrice = getItemPriceSync(item.id, cityName)
      setPrice(currentPrice ? currentPrice.toString() : '')
      setError('')
    }
  }, [item, cityName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!item) return
    
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Veuillez entrer un prix valide')
      return
    }
    
    try {
      await addPrice(item.id, numPrice, cityName)
      await refreshPriceCache(cityName)
      onSave()
      onClose()
    } catch (error) {
      setError('Erreur lors de la sauvegarde du prix')
      console.error('Erreur:', error)
    }
  }

  const handleClose = () => {
    setPrice('')
    setError('')
    onClose()
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-bitcraft-dark">
            Définir le prix
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs">IMG</span>
            </div>
            <div>
              <h3 className="font-medium text-bitcraft-dark">{item.name}</h3>
              <p className="text-sm text-gray-600">
                {item.type} • Tier {item.tier}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Ville:</span> {cityName}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix (en pièces)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Entrez le prix..."
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary bg-white text-gray-700 placeholder-gray-400"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bitcraft-primary text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}