export default function Recommendations() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Recommandations
        </h1>
        <p className="text-gray-300">
          Découvrez les meilleures opportunités de farming et de crafting
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
            🌾 Meilleur Farming
          </h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-bitcraft-dark">Ressource à farmer</h3>
                  <p className="text-sm text-gray-600">Tier 1 • Temps estimé: 5min</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-bitcraft-secondary">
                    +50 pièces/h
                  </div>
                  <div className="text-sm text-gray-500">
                    Profit par heure
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 text-gray-500">
            <p>Définissez des prix pour obtenir des recommandations précises</p>
          </div>
        </div>

        <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
            🔨 Meilleur Crafting
          </h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-bitcraft-dark">Objet à crafter</h3>
                  <p className="text-sm text-gray-600">Tier 1 • Coût: 20 pièces</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-bitcraft-accent">
                    +30 pièces
                  </div>
                  <div className="text-sm text-gray-500">
                    Profit par craft
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 text-gray-500">
            <p>Définissez des prix pour obtenir des recommandations précises</p>
          </div>
        </div>
      </div>

      <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
          📊 Analyse détaillée
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-bitcraft-primary">0</div>
            <div className="text-sm text-gray-600">Objets analysés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-bitcraft-secondary">0</div>
            <div className="text-sm text-gray-600">Prix définis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-bitcraft-accent">0</div>
            <div className="text-sm text-gray-600">Recommandations</div>
          </div>
        </div>
      </div>
    </div>
  )
}