const cleanItemsData = require('../data/bitcraft-items-tier1-clean.json')

const API_BASE_URL = 'http://localhost:3001/api'

async function makeAPICall(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

async function cleanDatabaseViaAPI() {
  try {
    console.log('🧹 Début du nettoyage de la base de données via API...')
    
    // 1. Vérifier que l'API est accessible
    console.log('🔍 Vérification de la connexion API...')
    try {
      await makeAPICall('/health')
      console.log('✅ API accessible')
    } catch (error) {
      console.error('❌ API non accessible. Assurez-vous que le serveur est démarré avec `npm run server`')
      throw error
    }
    
    // 2. Réinitialiser avec les nouvelles données nettoyées
    console.log('📥 Réinitialisation avec les objets nettoyés...')
    const result = await makeAPICall('/items/init', 'POST', { items: cleanItemsData })
    
    console.log(`✅ ${result.count} objets initialisés`)
    
    // 3. Afficher le résumé
    const tools = cleanItemsData.filter(item => item.type === 'tool')
    const crafted = cleanItemsData.filter(item => item.type === 'crafted')
    
    console.log(`\n📈 Résumé du nettoyage:`)
    console.log(`   • ${tools.length} outils`)
    console.log(`   • ${crafted.length} objets craftés`)
    console.log(`   • Total: ${result.count} objets`)
    
    console.log('\n✅ Nettoyage terminé avec succès!')
    console.log('ℹ️  La base ne contient maintenant que des vrais objets échangeables.')
    console.log('📋 Objets supprimés: toutes les ressources du monde (Button Mushrooms, Salt Deposit, etc.)')
    console.log('📋 Objets conservés: outils et objets craftés seulement')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message)
    throw error
  }
}

// Exécuter le script
console.log('🚀 Script de nettoyage de la base de données')
console.log('🔧 Ce script supprime toutes les "ressources" et ne garde que les vrais objets')
console.log('⚠️  Assurez-vous que le serveur API est démarré (npm run server)\n')

cleanDatabaseViaAPI()
  .then(() => {
    console.log('\n🎉 Script de nettoyage terminé!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Échec du script de nettoyage:', error.message)
    console.log('\n🔧 Solution: Démarrez le serveur avec `npm run server` dans un autre terminal')
    process.exit(1)
  })