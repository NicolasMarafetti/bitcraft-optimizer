import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCities } from '../utils/priceManager'

interface CityContextType {
  selectedCity: string
  setSelectedCity: (city: string) => void
  availableCities: string[]
  refreshCities: () => Promise<void>
  isLoading: boolean
}

const CityContext = createContext<CityContextType | undefined>(undefined)

interface CityProviderProps {
  children: ReactNode
}

const DEFAULT_CITY = 'Ma Ville'
const CITY_STORAGE_KEY = 'bitcraft-selected-city'

export const CityProvider: React.FC<CityProviderProps> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(DEFAULT_CITY)
  const [availableCities, setAvailableCities] = useState<string[]>([DEFAULT_CITY])
  const [isLoading, setIsLoading] = useState(true)

  // Charger la ville depuis localStorage au démarrage
  useEffect(() => {
    const savedCity = localStorage.getItem(CITY_STORAGE_KEY)
    if (savedCity) {
      setSelectedCityState(savedCity)
    }
    
    // Charger les villes disponibles
    refreshCities()
  }, [])

  const refreshCities = async () => {
    try {
      setIsLoading(true)
      const cities = await getCities()
      
      // Toujours inclure la ville par défaut et la ville actuellement sélectionnée
      const allCities = Array.from(new Set([DEFAULT_CITY, selectedCity, ...cities]))
      setAvailableCities(allCities)
      
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error)
      // En cas d'erreur, garder au moins la ville par défaut et la ville sélectionnée
      setAvailableCities(Array.from(new Set([DEFAULT_CITY, selectedCity])))
    } finally {
      setIsLoading(false)
    }
  }

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city)
    localStorage.setItem(CITY_STORAGE_KEY, city)
  }

  const value: CityContextType = {
    selectedCity,
    setSelectedCity,
    availableCities,
    refreshCities,
    isLoading
  }

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  )
}

export const useCity = (): CityContextType => {
  const context = useContext(CityContext)
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider')
  }
  return context
}

export default CityContext