import {
  generateProductsCatalogMetadata,
  ProductsCatalogPage,
  type ProductsCatalogPageProps,
} from "@/components/products-catalog-page"

export const generateMetadata = generateProductsCatalogMetadata

export default function ShopPage(props: ProductsCatalogPageProps) {
  return <ProductsCatalogPage {...props} />
}
