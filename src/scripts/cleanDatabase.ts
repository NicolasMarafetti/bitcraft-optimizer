import { prisma } from '../lib/prisma'
import cleanItemsData from '../data/bitcraft-items-tier1-clean.json'

async function cleanDatabase() {
  try {
    console.log('🧹 Début du nettoyage de la base de données...')
    
    // 1. Supprimer tous les prix existants
    console.log('📊 Suppression des prix existants...')
    const deletedPrices = await prisma.itemPrice.deleteMany({})
    console.log(`✅ ${deletedPrices.count} prix supprimés`)
    
    // 2. Supprimer tous les coûts de crafting existants
    console.log('🔨 Suppression des coûts de crafting existants...')
    const deletedCosts = await prisma.craftingCost.deleteMany({})
    console.log(`✅ ${deletedCosts.count} coûts de crafting supprimés`)
    
    // 3. Supprimer tous les objets existants
    console.log('📦 Suppression des objets existants...')
    const deletedItems = await prisma.bitCraftItem.deleteMany({})
    console.log(`✅ ${deletedItems.count} objets supprimés`)
    
    // 4. Insérer les nouveaux objets nettoyés (seulement tools et crafted)
    console.log('📥 Insertion des objets nettoyés...')
    let insertedCount = 0
    
    for (const item of cleanItemsData) {
      await prisma.bitCraftItem.create({
        data: {
          id: item.id,
          name: item.name,
          tier: item.tier,
          type: item.type,
          description: item.description,
          rarity: item.rarity,
          farmingTime: null, // Pas de farmingTime pour les objets craftés/tools
          craftingTime: item.craftingTime || null,
          imageUrl: item.imageUrl
        }
      })
      insertedCount++
    }
    
    console.log(`✅ ${insertedCount} objets insérés`)
    
    // 5. Afficher le résumé
    const tools = cleanItemsData.filter(item => item.type === 'tool')
    const crafted = cleanItemsData.filter(item => item.type === 'crafted')
    
    console.log(`\n📈 Résumé du nettoyage:`)
    console.log(`   • ${tools.length} outils`)
    console.log(`   • ${crafted.length} objets craftés`)
    console.log(`   • Total: ${insertedCount} objets`)
    console.log(`   • ${deletedItems.count - insertedCount} ressources supprimées`)
    
    console.log('\n✅ Nettoyage terminé avec succès!')
    console.log('ℹ️  La base ne contient maintenant que des vrais objets échangeables.')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('\n🎉 Script de nettoyage terminé!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Échec du script de nettoyage:', error)
      process.exit(1)
    })
}

export default cleanDatabase