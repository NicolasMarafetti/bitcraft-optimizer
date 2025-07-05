export default function Prices() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Gestion des Prix
        </h1>
        <p className="text-gray-300">
          Définissez les prix des objets dans votre ville pour des recommandations précises
        </p>
      </div>

      <div className="bg-bitcraft-light rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
            Ajouter un prix
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objet
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary bg-white text-gray-700">
                <option value="">Sélectionnez un objet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (pièces)
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary bg-white text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-bitcraft-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-bitcraft-dark mb-4">
            Prix actuels
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-bitcraft-dark">Exemple d'objet</span>
                <span className="text-gray-500 text-sm ml-2">• Tier 1</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-bitcraft-primary">100 pièces</span>
                <button className="text-red-500 hover:text-red-700 text-sm">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-gray-500">
            <p>Aucun prix défini pour le moment.</p>
          </div>
        </div>
      </div>
    </div>
  )
}