import { useState, useEffect } from 'react'
import { BitCraftItem } from '../types'
import { loadBitCraftItems, searchItems, createItem, deleteItem } from '../utils/dataLoader'
import { initializePriceManager } from '../utils/priceManager'
import { initializeDatabase, checkApiConnection } from '../utils/initializeDatabase'
import { useCity } from '../contexts/CityContext'
import ItemCard from '../components/ItemCard'
import PriceModal from '../components/PriceModal'
import CreateItemModal from '../components/CreateItemModal'

export default function Items() {
  const { selectedCity } = useCity()
  const [items, setItems] = useState<BitCraftItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState<BitCraftItem[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<BitCraftItem | null>(null)
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false)
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      const allItems = await loadBitCraftItems()
      setItems(allItems)
      setFilteredItems(allItems)

      // Vérifier la connexion API
      const apiConnected = await checkApiConnection()
      setIsApiConnected(apiConnected)

      if (apiConnected) {
        // Initialiser la base de données si nécessaire
        await initializeDatabase()

        // Initialiser le cache des prix
        await initializePriceManager(selectedCity)
      } else {
        console.warn('API non disponible - mode hors ligne')
      }
    }

    initializeData()
  }, [])

  // Effet pour réagir aux changements de ville
  useEffect(() => {
    const updatePricesForCity = async () => {
      if (isApiConnected && selectedCity) {
        await initializePriceManager(selectedCity)
        // Force re-render pour mettre à jour les prix affichés
        setFilteredItems([...filteredItems])
      }
    }
    
    updatePricesForCity()
  }, [selectedCity, isApiConnected])

  useEffect(() => {
    const searchItemsEffect = async () => {
      let result = items

      // Filtrer par recherche
      if (searchQuery) {
        result = await searchItems(searchQuery)
      }

      // Filtrer par type
      if (selectedType !== 'all') {
        result = result.filter(item => item.type === selectedType)
      }

      setFilteredItems(result)
    }

    searchItemsEffect();
  }, [searchQuery, selectedType, items])

  const handleSetPrice = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setSelectedItem(item)
      setIsPriceModalOpen(true)
    }
  }

  const handlePriceModalClose = () => {
    setIsPriceModalOpen(false)
    setSelectedItem(null)
  }

  const handlePriceSave = () => {
    // Force re-render pour mettre à jour les prix affichés
    setFilteredItems([...filteredItems])
  }

  const handleDeleteItem = async (itemId: string) => {
    const success = await deleteItem(itemId)
    if (success) {
      const updatedItems = items.filter(item => item.id !== itemId)
      setItems(updatedItems)
      setFilteredItems(updatedItems)
    }
  }

  const handleCreateItem = async (itemData: { name: string; tier: number; imageUrl?: string }) => {
    const newItem = await createItem(itemData)
    if (newItem) {
      const updatedItems = [...items, newItem]
      setItems(updatedItems)
      setFilteredItems(updatedItems)
      setIsCreateItemModalOpen(false)
    }
  }

  const itemTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'resource', label: 'Ressources' },
    { value: 'crafted', label: 'Objets craftés' },
    { value: 'tool', label: 'Outils' },
    { value: 'equipment', label: 'Équipement' }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Objets BitCraft
        </h1>
        <p className="text-gray-300">
          Liste complète des objets disponibles dans BitCraft (Tier 1)
        </p>
      </div>

      <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcraft-primary bg-white text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcraft-primary bg-white text-gray-700"
              >
                {itemTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{filteredItems.length} objet(s) trouvé(s)</span>
            <div className="flex items-center space-x-4">
              {isApiConnected === true && (
                <button
                  onClick={() => setIsCreateItemModalOpen(true)}
                  className="bg-bitcraft-primary text-white px-4 py-2 rounded-lg hover:bg-bitcraft-secondary transition-colors font-medium"
                >
                  Ajouter un objet
                </button>
              )}
              {isApiConnected === null && (
                <span className="text-yellow-600">⏳ Connexion...</span>
              )}
              {isApiConnected === false && (
                <span className="text-red-600">❌ API indisponible</span>
              )}
              {isApiConnected === true && (
                <span className="text-green-600">✅ Connecté</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              cityName={selectedCity}
              onSetPrice={handleSetPrice}
              onDeleteItem={isApiConnected ? handleDeleteItem : undefined}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center mt-8 text-gray-500">
            <p>Aucun objet ne correspond à votre recherche.</p>
            <p className="text-sm mt-2">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      <PriceModal
        item={selectedItem}
        cityName={selectedCity}
        isOpen={isPriceModalOpen}
        onClose={handlePriceModalClose}
        onSave={handlePriceSave}
      />

      <CreateItemModal
        isOpen={isCreateItemModalOpen}
        onClose={() => setIsCreateItemModalOpen(false)}
        onSave={handleCreateItem}
      />
    </div>
  )
}