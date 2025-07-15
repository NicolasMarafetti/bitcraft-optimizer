const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Types pour les objets de l'API
interface ApiItem {
  id: string
  name: string
  tier: number
  type: string
  description?: string
  rarity?: string
  imageUrl?: string
  farmingTime?: number
  craftingTime?: number
}

interface ApiPrice {
  id: string
  price: number
  cityName: string
  lastUpdated: string
  item?: ApiItem
}

// Classe pour gérer les appels API
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health')
  }

  // Objets BitCraft
  async getItems(): Promise<ApiItem[]> {
    return this.request('/items')
  }

  async initializeItems(items: any[]): Promise<{ success: boolean; count: number }> {
    return this.request('/items/init', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
  }

  async createItem(item: { name: string; tier: number; imageUrl?: string }): Promise<ApiItem> {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async deleteItem(itemId: string): Promise<{ success: boolean }> {
    return this.request(`/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  async updateItem(itemId: string, updates: any): Promise<{ success: boolean }> {
    return this.request(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Prix
  async getPricesForCity(cityName: string): Promise<ApiPrice[]> {
    return this.request(`/prices/${encodeURIComponent(cityName)}`)
  }

  async getItemPrice(cityName: string, itemName: string): Promise<{ price: number | null }> {
    return this.request(`/prices/${encodeURIComponent(cityName)}/${encodeURIComponent(itemName)}`)
  }

  async setItemPrice(itemName: string, price: number, cityName: string): Promise<ApiPrice> {
    return this.request('/prices', {
      method: 'POST',
      body: JSON.stringify({ itemName, price, cityName }),
    })
  }

  async removeItemPrice(cityName: string, itemName: string): Promise<{ success: boolean }> {
    return this.request(`/prices/${encodeURIComponent(cityName)}/${encodeURIComponent(itemName)}`, {
      method: 'DELETE',
    })
  }

  // Villes
  async getCities(): Promise<string[]> {
    return this.request('/cities')
  }

  // Recettes de craft
  async getItemRecipe(itemId: string): Promise<{ materials: Array<{ itemId: string; quantity: number; item: ApiItem }>; outputs: Array<{ itemId: string; quantity: number; item: ApiItem }> }> {
    return this.request(`/items/${itemId}/recipe`)
  }

  async setItemRecipe(itemId: string, materials: Array<{ itemId: string; quantity: number }>, outputs: Array<{ itemId: string; quantity: number }>): Promise<{ success: boolean; message: string }> {
    return this.request(`/items/${itemId}/recipe`, {
      method: 'POST',
      body: JSON.stringify({ materials, outputs }),
    })
  }

  async removeItemRecipe(itemId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/items/${itemId}/recipe`, {
      method: 'DELETE',
    })
  }
}

// Instance singleton de l'API client
export const apiClient = new ApiClient()

// Fonctions utilitaires pour l'API
export const api = {
  // Health check
  healthCheck: () => apiClient.healthCheck(),

  // Objets
  getItems: () => apiClient.getItems(),
  initializeItems: (items: any[]) => apiClient.initializeItems(items),
  createItem: (item: { name: string; tier: number; imageUrl?: string }) => apiClient.createItem(item),
  deleteItem: (itemId: string) => apiClient.deleteItem(itemId),
  updateItem: (itemId: string, updates: any) => apiClient.updateItem(itemId, updates),

  // Prix
  getPricesForCity: (cityName: string) => apiClient.getPricesForCity(cityName),
  getItemPrice: (cityName: string, itemName: string) => apiClient.getItemPrice(cityName, itemName),
  setItemPrice: (itemName: string, price: number, cityName: string) => 
    apiClient.setItemPrice(itemName, price, cityName),
  removeItemPrice: (cityName: string, itemName: string) => 
    apiClient.removeItemPrice(cityName, itemName),

  // Villes
  getCities: () => apiClient.getCities(),

  // Recettes de craft
  getItemRecipe: (itemId: string) => apiClient.getItemRecipe(itemId),
  setItemRecipe: (itemId: string, materials: Array<{ itemId: string; quantity: number }>, outputs: Array<{ itemId: string; quantity: number }>) => 
    apiClient.setItemRecipe(itemId, materials, outputs),
  removeItemRecipe: (itemId: string) => apiClient.removeItemRecipe(itemId),
}

export default api