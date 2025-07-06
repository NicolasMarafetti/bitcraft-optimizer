import { api } from '../lib/api';

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔗 Test de connexion à l\'API...')

    // Test de santé de l'API
    const health = await api.healthCheck()
    console.log('✅ API disponible:', health.message)

    return true
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