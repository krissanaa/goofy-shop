export function formatPrice(price: number): string {
  return `\u20AD${price.toLocaleString("en-US")}`
}
