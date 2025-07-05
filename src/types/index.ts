export interface BitCraftItem {
  id: string
  name: string
  tier: number
  type: 'resource' | 'crafted' | 'tool' | 'equipment'
  description?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  imageUrl?: string
  farmingTime?: number // en minutes
  craftingTime?: number // en minutes
  craftingCost?: CraftingCost[]
}

export interface CraftingCost {
  itemId: string
  quantity: number
}

export interface ItemPrice {
  id: string
  itemId: string
  price: number
  cityName: string
  lastUpdated: Date
}

export interface FarmingRecommendation {
  item: BitCraftItem
  profitPerHour: number
  farmingTime: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface CraftingRecommendation {
  item: BitCraftItem
  profitPerCraft: number
  craftingCost: number
  materials: CraftingMaterial[]
  profitMargin: number
}

export interface CraftingMaterial {
  item: BitCraftItem
  quantity: number
  cost: number
}