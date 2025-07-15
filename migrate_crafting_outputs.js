const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Charger les variables d'environnement
dotenv.config()

const prisma = new PrismaClient()

async function migrateCraftingOutputs() {
  try {
    console.log('🔄 Début de la migration des outputs de craft...')
    
    // Récupérer tous les items qui ont des crafting costs (donc des recettes)
    const itemsWithRecipes = await prisma.bitCraftItem.findMany({
      where: {
        craftingCosts: {
          some: {}
        }
      },
      include: {
        craftingCosts: true
      }
    })

    console.log(`📊 Trouvé ${itemsWithRecipes.length} objets avec des recettes existantes`)
    
    let migratedCount = 0
    
    for (const item of itemsWithRecipes) {
      // Vérifier si l'objet a déjà des outputs
      const existingOutputs = await prisma.craftingOutput.findMany({
        where: { itemId: item.id }
      })
      
      if (existingOutputs.length === 0) {
        // Créer un output par défaut: 1 unité de l'objet lui-même
        await prisma.craftingOutput.create({
          data: {
            itemId: item.id,
            outputItemId: item.id,
            quantity: 1
          }
        })
        
        migratedCount++
        console.log(`✅ Migration pour ${item.name}: 1x ${item.name}`)
      } else {
        console.log(`⏭️  ${item.name} a déjà des outputs, ignoré`)
      }
    }
    
    console.log(`🎉 Migration terminée! ${migratedCount} objets migrés`)
    
    // Vérification finale
    const totalOutputs = await prisma.craftingOutput.count()
    console.log(`📈 Total des outputs en base: ${totalOutputs}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour rollback en cas de problème
async function rollbackMigration() {
  try {
    console.log('🔄 Début du rollback de la migration...')
    
    // Supprimer tous les outputs où outputItemId = itemId (les outputs par défaut)
    const result = await prisma.craftingOutput.deleteMany({
      where: {
        itemId: {
          equals: prisma.craftingOutput.fields.outputItemId
        }
      }
    })
    
    console.log(`🎉 Rollback terminé! ${result.count} outputs supprimés`)
    
  } catch (error) {
    console.error('❌ Erreur lors du rollback:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
const command = process.argv[2]

if (command === 'rollback') {
  rollbackMigration()
} else {
  migrateCraftingOutputs()
}