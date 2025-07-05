#!/usr/bin/env node

import { initializeDatabase, testDatabaseConnection, disconnectDatabase } from '../lib/database'

async function main() {
  console.log('=== BitCraft Optimizer - Initialisation de la base de données ===\n')
  
  // Test de connexion
  console.log('🔗 Test de connexion à la base de données...')
  const isConnected = await testDatabaseConnection()
  
  if (!isConnected) {
    console.error('❌ Impossible de se connecter à la base de données')
    console.error('Vérifiez que MongoDB est en cours d\'exécution et que DATABASE_URL est correctement configuré dans .env')
    process.exit(1)
  }
  
  console.log('✅ Connexion à la base de données réussie\n')
  
  // Initialisation des données
  console.log('📦 Initialisation des objets BitCraft...')
  const isInitialized = await initializeDatabase()
  
  if (!isInitialized) {
    console.error('❌ Erreur lors de l\'initialisation des données')
    process.exit(1)
  }
  
  console.log('✅ Objets BitCraft initialisés avec succès\n')
  
  // Fermeture de la connexion
  await disconnectDatabase()
  console.log('🎉 Initialisation terminée avec succès!')
  console.log('\nVous pouvez maintenant démarrer l\'application avec :')
  console.log('npm run dev')
}

main().catch((error) => {
  console.error('❌ Erreur lors de l\'initialisation:', error)
  process.exit(1)
})