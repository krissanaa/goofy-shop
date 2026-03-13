import { redirect } from "next/navigation"

interface ProductsRedirectPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsRedirectPage({
  searchParams,
}: ProductsRedirectPageProps) {
  const params = await searchParams
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") {
          query.append(key, item)
        }
      })
      continue
    }

    if (typeof value === "string") {
      query.set(key, value)
    }
  }

  redirect(query.toString() ? `/shop?${query.toString()}` : "/shop")
}
