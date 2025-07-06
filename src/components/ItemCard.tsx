import { useState, useRef } from 'react'
import { BitCraftItem } from '../types'
import { getItemPriceSync, addPrice, removePrice } from '../utils/priceManager'
import { useNotifications } from '../contexts/NotificationContext'

interface ItemCardProps {
  item: BitCraftItem
  cityName: string
  onSetPrice?: (itemId: string) => void
  onDeleteItem?: (itemId: string) => void
  onPriceUpdate?: () => void
  onSetRecipe?: (item: BitCraftItem) => void
  onUpdateImage?: (itemId: string, imageUrl: string) => void
}

export default function ItemCard({ item, cityName, onSetPrice, onDeleteItem, onPriceUpdate, onSetRecipe, onUpdateImage }: ItemCardProps) {
  const { showSuccess, showError } = useNotifications()
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [isQuickEditMode, setIsQuickEditMode] = useState(false)
  const [quickPrice, setQuickPrice] = useState('')
  const [isImageEditMode, setIsImageEditMode] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
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

  const handleQuickPriceSubmit = async () => {
    const priceValue = parseFloat(quickPrice)
    
    if (!isNaN(priceValue) && priceValue > 0) {
      const result = await addPrice(item.id, priceValue, cityName)
      
      if (result) {
        showSuccess('Prix mis à jour', `${item.name}: ${priceValue} pièces`)
        setIsQuickEditMode(false)
        setQuickPrice('')
        onPriceUpdate?.()
      } else {
        showError('Erreur de prix', 'Impossible de mettre à jour le prix')
      }
    }
  }

  const handleQuickPriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickPriceSubmit()
    } else if (e.key === 'Escape') {
      setIsQuickEditMode(false)
      setQuickPrice('')
    }
  }

  const startQuickEdit = () => {
    setIsQuickEditMode(true)
    setQuickPrice(price?.toString() || '')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const startImageEdit = () => {
    setIsImageEditMode(true)
    setImageUrl(item.imageUrl || '')
    setTimeout(() => imageInputRef.current?.focus(), 0)
  }

  const handleImageUpdate = async () => {
    if (onUpdateImage) {
      const success = await onUpdateImage(item.id, imageUrl)
      if (success) {
        setIsImageEditMode(false)
      }
    }
  }

  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleImageUpdate()
    } else if (e.key === 'Escape') {
      setIsImageEditMode(false)
      setImageUrl('')
    }
  }

  const handleRemovePrice = async () => {
    const success = await removePrice(item.id, cityName)
    if (success) {
      showSuccess('Prix supprimé', `Prix de ${item.name} supprimé`)
      onPriceUpdate?.()
    } else {
      showError('Erreur de suppression', 'Impossible de supprimer le prix')
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
          {onSetRecipe && (item.type === 'crafted' || item.type === 'tool' || item.type === 'equipment') && (
            <button
              onClick={() => onSetRecipe(item)}
              className="text-bitcraft-primary hover:text-bitcraft-secondary transition-colors p-1 rounded"
              title="Gérer la recette de craft"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
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
      
      <div className="mb-3 flex justify-center items-center space-x-2">
        {item.imageUrl && !isImageEditMode && (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        {isImageEditMode && (
          <div className="flex items-center space-x-2">
            <input
              ref={imageInputRef}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={handleImageKeyDown}
              onBlur={(e) => {
                if (!e.relatedTarget || !e.relatedTarget.closest('[data-save-image-button]')) {
                  setIsImageEditMode(false)
                }
              }}
              className="px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="URL de l'image"
            />
            <button
              data-save-image-button
              onMouseDown={(e) => {
                e.preventDefault()
                handleImageUpdate()
              }}
              className="text-green-600 hover:text-green-700 p-1"
              title="Sauvegarder l'image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}
        {onUpdateImage && !isImageEditMode && (
          <button
            onClick={startImageEdit}
            className="text-gray-400 hover:text-bitcraft-primary transition-colors p-1 rounded"
            title={item.imageUrl ? "Modifier l'image" : "Ajouter une image"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}
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
        
        {item.craftingCost && item.craftingCost.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-500">Recette:</span>
            <div className="text-xs text-gray-600 mt-1">
              {item.craftingCost.slice(0, 3).map((cost, index) => (
                <span key={index} className="inline-block mr-2">
                  {cost.quantity}x matériau
                </span>
              ))}
              {item.craftingCost.length > 3 && <span className="text-gray-500">...</span>}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-medium text-gray-700">Prix:</span>
          <div className="flex items-center space-x-2">
            {isQuickEditMode ? (
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="number"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  onKeyDown={handleQuickPriceKeyDown}
                  onBlur={(e) => {
                    // Ne fermer que si on ne clique pas sur le bouton de validation
                    if (!e.relatedTarget || !e.relatedTarget.closest('[data-save-button]')) {
                      setIsQuickEditMode(false)
                    }
                  }}
                  className="w-20 px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Prix"
                />
                <button
                  data-save-button
                  onMouseDown={(e) => {
                    e.preventDefault() // Empêche le blur de l'input
                    handleQuickPriceSubmit()
                  }}
                  className="text-green-600 hover:text-green-700 p-1"
                  title="Sauvegarder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                {price !== null ? (
                  <div className="flex items-center space-x-2">
                    <div 
                      className="flex items-center space-x-2 cursor-pointer group" 
                      onClick={startQuickEdit}
                      title="Cliquer pour modifier rapidement"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Prix renseigné"></div>
                      <span className="text-bitcraft-primary font-semibold group-hover:text-bitcraft-secondary transition-colors">
                        {price} pièces
                      </span>
                      <svg className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <button
                      onClick={handleRemovePrice}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                      title="Supprimer le prix"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center space-x-2 cursor-pointer group" 
                    onClick={startQuickEdit}
                    title="Cliquer pour renseigner le prix"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Prix non renseigné"></div>
                    <span className="text-orange-600 font-medium group-hover:text-orange-700 transition-colors">À renseigner</span>
                    <svg className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
              </>
            )}
            {onSetPrice && !isQuickEditMode && (
              <button
                onClick={() => onSetPrice(item.id)}
                className="text-bitcraft-secondary hover:text-bitcraft-primary text-xs font-medium transition-colors"
              >
                Modal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}