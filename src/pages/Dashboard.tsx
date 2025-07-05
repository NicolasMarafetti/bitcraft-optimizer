export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          BitCraft Optimizer
        </h1>
        <p className="text-gray-300 text-lg">
          Optimisez vos gains dans BitCraft en trouvant les meilleures ressources à farmer ou crafter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-bitcraft-dark mb-3">
            Objets Tier 1
          </h3>
          <p className="text-gray-600 mb-4">
            Découvrez tous les objets disponibles de tier 1 dans BitCraft.
          </p>
          <div className="text-2xl font-bold text-bitcraft-primary">
            47 objets
          </div>
        </div>

        <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-bitcraft-dark mb-3">
            Prix à jour
          </h3>
          <p className="text-gray-600 mb-4">
            Gérez les prix des objets dans votre ville.
          </p>
          <div className="text-2xl font-bold text-bitcraft-secondary">
            0 prix
          </div>
        </div>

        <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-bitcraft-dark mb-3">
            Recommandations
          </h3>
          <p className="text-gray-600 mb-4">
            Obtenez des conseils personnalisés pour optimiser vos gains.
          </p>
          <div className="text-2xl font-bold text-bitcraft-accent">
            Bientôt disponible
          </div>
        </div>
      </div>
    </div>
  )
}