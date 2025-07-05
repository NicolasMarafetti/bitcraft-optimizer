import React, { useState } from 'react'
import { useCity } from '../contexts/CityContext'

interface CitySelectorProps {
  className?: string
}

const CitySelector: React.FC<CitySelectorProps> = ({ className = '' }) => {
  const { selectedCity, setSelectedCity, availableCities, refreshCities, isLoading } = useCity()
  const [isAddingCity, setIsAddingCity] = useState(false)
  const [newCityName, setNewCityName] = useState('')

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value === '__add_new__') {
      setIsAddingCity(true)
    } else {
      setSelectedCity(value)
    }
  }

  const handleAddCity = () => {
    if (newCityName.trim() && !availableCities.includes(newCityName.trim())) {
      setSelectedCity(newCityName.trim())
      setIsAddingCity(false)
      setNewCityName('')
      // Rafraîchir la liste des villes pour inclure la nouvelle
      refreshCities()
    }
  }

  const handleCancelAddCity = () => {
    setIsAddingCity(false)
    setNewCityName('')
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddCity()
    } else if (event.key === 'Escape') {
      handleCancelAddCity()
    }
  }

  if (isAddingCity) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          type="text"
          value={newCityName}
          onChange={(e) => setNewCityName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Nom de la ville..."
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary focus:border-transparent"
          autoFocus
        />
        <button
          onClick={handleAddCity}
          disabled={!newCityName.trim()}
          className="px-3 py-2 bg-bitcraft-primary text-white rounded-md hover:bg-bitcraft-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          ✓
        </button>
        <button
          onClick={handleCancelAddCity}
          className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          ✗
        </button>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="city-select" className="text-sm font-medium">
        Ville:
      </label>
      <select
        id="city-select"
        value={selectedCity}
        onChange={handleCityChange}
        disabled={isLoading}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bitcraft-primary focus:border-transparent bg-white disabled:bg-gray-100"
      >
        {availableCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
        <option value="__add_new__" className="border-t border-gray-300">
          + Ajouter une nouvelle ville
        </option>
      </select>
      {isLoading && (
        <div className="text-sm text-gray-500">
          ⏳ Chargement...
        </div>
      )}
    </div>
  )
}

export default CitySelector