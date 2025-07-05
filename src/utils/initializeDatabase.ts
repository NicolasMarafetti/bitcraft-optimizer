import { api } from '../lib/api'
import cleanItemsData from '../data/bitcraft-items-tier1-clean.json'

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔗 Test de connexion à l\'API...')
    
    // Test de santé de l'API
    const health = await api.healthCheck()
    console.log('✅ API disponible:', health.message)
    
    // Charger les objets depuis les fichiers JSON
    console.log('📦 Chargement des objets BitCraft...')
    const items = cleanItemsData
    
    // Initialiser les objets en base
    console.log('💾 Initialisation des objets en base de données...')
    const result = await api.initializeItems(items)
    
    if (result.success) {
      console.log(`✅ ${result.count} objets initialisés avec succès`)
      return true
    } else {
      console.error('❌ Erreur lors de l\'initialisation')
      return false
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error)
    return false
  }
}

export const checkApiConnection = async (): Promise<boolean> => {
  try {
    await api.healthCheck()
    return true
  } catch (error) {
    console.error('❌ API non disponible:', error)
    return false
  }
}