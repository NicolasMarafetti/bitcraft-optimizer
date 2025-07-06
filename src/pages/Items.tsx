import { useState, useEffect } from 'react'
import { BitCraftItem } from '../types'
import { loadBitCraftItems, createItem, deleteItem, updateItem } from '../utils/dataLoader'
import { initializePriceManager, getItemPriceSync } from '../utils/priceManager'
import { initializeDatabase, checkApiConnection } from '../utils/initializeDatabase'
import { useCity } from '../contexts/CityContext'
import { useNotifications } from '../contexts/NotificationContext'
import ItemCard from '../components/ItemCard'
import PriceModal from '../components/PriceModal'
import CreateItemModal from '../components/CreateItemModal'
import RecipeModal from '../components/RecipeModal'

export default function Items() {
  const { selectedCity } = useCity()
  const { showLoading, showSuccess, showError, removeNotification } = useNotifications()
  const [items, setItems] = useState<BitCraftItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState<BitCraftItem[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriceStatus, setSelectedPriceStatus] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<BitCraftItem | null>(null)
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<BitCraftItem | null>(null)
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null)

  const loadItems = async () => {
    const loadingId = showLoading('Chargement des objets...', 'Récupération de la liste des objets BitCraft')
    try {
      const allItems = await loadBitCraftItems()
      setItems(allItems)
      setFilteredItems(allItems)
      removeNotification(loadingId)
      showSuccess('Objets chargés', `${allItems.length} objets récupérés avec succès`)
    } catch (error) {
      removeNotification(loadingId)
      showError('Erreur de chargement', 'Impossible de charger les objets')
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      await loadItems()

      // Vérifier la connexion API
      const checkingId = showLoading('Vérification de l\'API...', 'Connexion au serveur')
      try {
        const apiConnected = await checkApiConnection()
        setIsApiConnected(apiConnected)
        removeNotification(checkingId)

        if (apiConnected) {
          showSuccess('API connectée', 'Connexion au serveur réussie')
          
          // Initialiser la base de données si nécessaire
          const dbId = showLoading('Initialisation...', 'Configuration de la base de données')
          await initializeDatabase()
          removeNotification(dbId)

          // Initialiser le cache des prix
          const priceId = showLoading('Chargement des prix...', `Récupération des prix pour ${selectedCity}`)
          await initializePriceManager(selectedCity)
          removeNotification(priceId)
          
          showSuccess('Initialisation terminée', 'Toutes les données sont prêtes')
        } else {
          showError('API indisponible', 'Mode hors ligne activé')
        }
      } catch (error) {
        removeNotification(checkingId)
        showError('Erreur de connexion', 'Impossible de se connecter à l\'API')
        setIsApiConnected(false)
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
    let result = items

    // Filtrer par recherche
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery)
      )
    }

    // Filtrer par type
    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType)
    }

    // Filtrer par statut de prix
    if (selectedPriceStatus !== 'all') {
      result = result.filter(item => {
        const price = getItemPriceSync(item.id, selectedCity)
        
        switch (selectedPriceStatus) {
          case 'with_price':
            return price !== null
          case 'without_price':
            return price === null
          default:
            return true
        }
      })
    }

    setFilteredItems(result)
  }, [searchQuery, selectedType, selectedPriceStatus, items, selectedCity])

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

  const handlePriceUpdate = () => {
    // Force re-render pour mettre à jour les prix affichés après saisie rapide
    // On force une mise à jour en changeant la référence des objets
    setItems([...items])
    setFilteredItems([...filteredItems])
  }

  const handleDeleteItem = async (itemId: string) => {
    const deletingId = showLoading('Suppression...', 'Suppression de l\'objet en cours')
    try {
      const success = await deleteItem(itemId)
      removeNotification(deletingId)
      
      if (success) {
        showSuccess('Objet supprimé', 'L\'objet a été supprimé avec succès')
        // Recharger les items depuis l'API pour s'assurer de la cohérence
        await loadItems()
      } else {
        showError('Erreur de suppression', 'Impossible de supprimer l\'objet')
      }
    } catch (error) {
      removeNotification(deletingId)
      showError('Erreur de suppression', 'Une erreur est survenue lors de la suppression')
    }
  }

  const handleCreateItem = async (itemData: { name: string; tier: number; imageUrl?: string }) => {
    const creatingId = showLoading('Création...', 'Création du nouvel objet')
    try {
      const newItem = await createItem(itemData)
      removeNotification(creatingId)
      
      if (newItem) {
        showSuccess('Objet créé', `${itemData.name} a été créé avec succès`)
        // Recharger les items depuis l'API pour s'assurer de la cohérence
        await loadItems()
        setIsCreateItemModalOpen(false)
      } else {
        showError('Erreur de création', 'Impossible de créer l\'objet')
      }
    } catch (error) {
      removeNotification(creatingId)
      showError('Erreur de création', 'Une erreur est survenue lors de la création')
    }
  }

  const handleSetRecipe = (item: BitCraftItem) => {
    setSelectedRecipeItem(item)
    setIsRecipeModalOpen(true)
  }

  const handleRecipeModalClose = () => {
    setIsRecipeModalOpen(false)
    setSelectedRecipeItem(null)
  }

  const handleRecipeSave = () => {
    // Recharger les items pour mettre à jour les recettes
    loadItems()
  }

  const handleUpdateImage = async (itemId: string, imageUrl: string): Promise<boolean> => {
    const updatingId = showLoading('Mise à jour...', 'Mise à jour de l\'image')
    try {
      const success = await updateItem(itemId, { imageUrl })
      removeNotification(updatingId)
      
      if (success) {
        showSuccess('Image mise à jour', 'L\'image a été mise à jour avec succès')
        // Recharger les items pour mettre à jour l'interface
        await loadItems()
        return true
      } else {
        showError('Erreur de mise à jour', 'Impossible de mettre à jour l\'image')
        return false
      }
    } catch (error) {
      removeNotification(updatingId)
      showError('Erreur de mise à jour', 'Une erreur est survenue lors de la mise à jour')
      return false
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
            <div className="md:w-48">
              <select
                value={selectedPriceStatus}
                onChange={(e) => setSelectedPriceStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcraft-primary bg-white text-gray-700"
              >
                <option value="all">Tous les prix</option>
                <option value="without_price">🟠 À renseigner</option>
                <option value="with_price">🟢 Prix renseigné</option>
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
              onPriceUpdate={handlePriceUpdate}
              onSetRecipe={isApiConnected ? handleSetRecipe : undefined}
              onUpdateImage={isApiConnected ? handleUpdateImage : undefined}
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

      {selectedRecipeItem && (
        <RecipeModal
          item={selectedRecipeItem}
          isOpen={isRecipeModalOpen}
          onClose={handleRecipeModalClose}
          onSave={handleRecipeSave}
        />
      )}
    </div>
  )
}