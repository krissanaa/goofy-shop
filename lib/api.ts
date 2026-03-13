import { supabase } from './supabase'

// PRODUCTS
export async function getProducts() {
  const { data } = await supabase
    .from('products').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function getProductsByBadge(badge: string, limit: number | null = 4) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('badge', badge)

  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    query = query.limit(limit)
  }

  const { data } = await query
  return data || []
}

export async function getProductsByCategory(category: string) {
  const { data } = await supabase
    .from('products').select('*').eq('category', category)
  return data || []
}

export async function getProductBySlug(slug: string) {
  const { data } = await supabase
    .from('products').select('*').eq('slug', slug).single()
  return data
}

// DROP EVENTS
export async function getActiveDropEvent() {
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('drop_events').select(`
      *,
      drop_event_products(product_id, products(*))
    `)
    .gt('end_date', now)
    .order('drop_date', { ascending: true })
    .limit(1).single()
  return data
}

export async function getDropEventBySlug(slug: string) {
  const { data } = await supabase
    .from('drop_events').select(`
      *,
      drop_event_products(product_id, products(*))
    `)
    .eq('slug', slug).single()
  return data
}

// VIDEOS
export async function getVideos(limit = 4) {
  const { data } = await supabase
    .from('videos').select('*')
    .order('published_date', { ascending: false }).limit(limit)
  return data || []
}

// SKATEPARKS
export async function getSkateparks() {
  const { data } = await supabase
    .from('skateparks').select('*').order('name')
  return data || []
}

// ORDERS
export async function createOrder(order: any) {
  const { data, error } = await supabase
    .from('orders').insert(order).select().single()
  return { data, error }
}

// NOTIFY LIST
export async function addToNotifyList(email: string, dropEventId: string) {
  const { error } = await supabase
    .from('notify_list').insert({ email, drop_event_id: dropEventId })
  return !error
}

export async function getCategories() {
  // Since categories are just a check constraint in the schema provided,
  // we might want to return a static list or fetch distinct categories from products.
  // The instructions don't specify a categories table.
  const { data } = await supabase
    .from('products')
    .select('category')

  if (!data) return []
  const uniqueCategories = Array.from(new Set(data.map(p => p.category)))
  return uniqueCategories.map(name => ({ title: name, slug: name.toLowerCase() }))
}
