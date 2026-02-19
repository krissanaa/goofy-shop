export interface Product {
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

export const products: Product[] = [
  {
    id: 'shadow-deck-pro',
    name: 'Shadow Deck Pro',
    price: 89,
    category: 'Decks',
    image: '/images/product-deck-1.jpg',
    stock: 12,
    isLimited: true,
    isSoldOut: false,
    sizes: ['7.75"', '8.0"', '8.25"', '8.5"'],
    colors: ['Black', 'Raw'],
    description: 'Pro-grade 7-ply Canadian maple with our signature concave. Built for the streets, finished for the gallery.',
  },
  {
    id: 'void-hoodie',
    name: 'Void Hoodie',
    price: 148,
    category: 'Apparel',
    image: '/images/product-hoodie-1.jpg',
    stock: 5,
    isLimited: true,
    isSoldOut: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Charcoal'],
    description: '450gsm heavyweight French terry. Dropped shoulders, raw-edge details, and a fit that moves with you.',
  },
  {
    id: 'night-cargo',
    name: 'Night Cargo',
    price: 128,
    category: 'Apparel',
    image: '/images/product-pants-1.jpg',
    stock: 18,
    isLimited: false,
    isSoldOut: false,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Black', 'Olive'],
    description: 'Ripstop nylon cargo pants with articulated knees and adjustable cuffs. Utilitarian design meets street-level comfort.',
  },
  {
    id: 'ghost-wheels-54',
    name: 'Ghost Wheels 54mm',
    price: 42,
    category: 'Hardware',
    image: '/images/product-wheels-1.jpg',
    stock: 34,
    isLimited: false,
    isSoldOut: false,
    sizes: ['52mm', '54mm', '56mm'],
    colors: ['White'],
    description: 'Premium urethane formula. 99A durometer for park and street. Smooth slides, fast rolls.',
  },
  {
    id: 'static-tee',
    name: 'Static Tee',
    price: 58,
    category: 'Apparel',
    image: '/images/product-tee-1.jpg',
    stock: 0,
    isLimited: true,
    isSoldOut: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    description: 'Screen-printed on 220gsm organic cotton. Part of the SS26 capsule collection.',
  },
  {
    id: 'stealth-cap',
    name: 'Stealth Cap',
    price: 44,
    category: 'Accessories',
    image: '/images/product-cap-1.jpg',
    stock: 22,
    isLimited: false,
    isSoldOut: false,
    sizes: ['One Size'],
    colors: ['Black', 'Grey'],
    description: 'Unstructured 6-panel cap with embroidered logo. Adjustable strap. One size fits all.',
  },
]

export const featuredDropProducts = products.slice(0, 4)

export const categories = ['All', 'Decks', 'Apparel', 'Hardware', 'Accessories']

export interface Order {
  id: string
  customer: string
  email: string
  total: number
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled'
  date: string
  items: number
}

export const recentOrders: Order[] = [
  { id: 'ORD-7291', customer: 'Marcus Chen', email: 'marcus@email.com', total: 237, status: 'Shipped', date: '2026-02-18', items: 3 },
  { id: 'ORD-7290', customer: 'Suki Yamada', email: 'suki@email.com', total: 148, status: 'Pending', date: '2026-02-18', items: 1 },
  { id: 'ORD-7289', customer: 'Alex Rivera', email: 'alex@email.com', total: 89, status: 'Delivered', date: '2026-02-17', items: 1 },
  { id: 'ORD-7288', customer: 'Jade Kim', email: 'jade@email.com', total: 314, status: 'Shipped', date: '2026-02-17', items: 4 },
  { id: 'ORD-7287', customer: 'Tyler Brooks', email: 'tyler@email.com', total: 172, status: 'Delivered', date: '2026-02-16', items: 2 },
  { id: 'ORD-7286', customer: 'Nina Petrov', email: 'nina@email.com', total: 58, status: 'Cancelled', date: '2026-02-16', items: 1 },
]
