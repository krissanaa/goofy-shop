export interface CatalogProduct {
  id: string
  name: string
  price: number
  category: string
  image: string
  stock: number
  isLimited: boolean
  isSoldOut: boolean
  sizes?: string[]
  colors?: string[]
  description?: string
}
