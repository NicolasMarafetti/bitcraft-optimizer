import { useState } from 'react'

interface CreateItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: { name: string; tier: number; imageUrl?: string }) => void
}

export default function CreateItemModal({ isOpen, onClose, onSave }: CreateItemModalProps) {
  const [name, setName] = useState('')
  const [tier, setTier] = useState(1)
  const [imageUrl, setImageUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Le nom de l\'objet est requis')
      return
    }
    
    onSave({
      name: name.trim(),
      tier,
      imageUrl: imageUrl.trim() || undefined
    })
    
    // Réinitialiser le formulaire
    setName('')
    setTier(1)
    setImageUrl('')
    onClose()
  }

  const handleClose = () => {
    setName('')
    setTier(1)
    setImageUrl('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-bitcraft-dark">Créer un nouvel objet</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'objet *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary"
              placeholder="Ex: Épée en fer"
              required
            />
          </div>

          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-1">
              Tier
            </label>
            <select
              id="tier"
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary"
            >
              <option value={1}>Tier 1</option>
              <option value={2}>Tier 2</option>
              <option value={3}>Tier 3</option>
              <option value={4}>Tier 4</option>
              <option value={5}>Tier 5</option>
            </select>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image (optionnel)
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary"
              placeholder="https://example.com/image.png"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-bitcraft-primary text-white rounded-md hover:bg-bitcraft-secondary transition-colors"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}