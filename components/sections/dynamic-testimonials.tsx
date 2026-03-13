interface DynamicTestimonialsProps {
  data: any
}

interface TestimonialItem {
  quote: string
  author: string
}

const FALLBACK_ITEMS: TestimonialItem[] = [
  { quote: "Best setup I have ridden all year. Fast shipping too.", author: "Mason R." },
  { quote: "Quality is premium. Looks clean and feels solid on every session.", author: "Aiko T." },
  { quote: "Drop day support was quick, and the deck arrived perfect.", author: "Jordan K." },
]

function normalizeItems(items: any[]): TestimonialItem[] {
  if (!Array.isArray(items) || items.length === 0) return FALLBACK_ITEMS

  const parsed = items
    .map((item) => {
      const quote = typeof item?.quote === "string" ? item.quote.trim() : ""
      const author = typeof item?.author === "string" ? item.author.trim() : ""
      if (!quote || !author) return null
      return { quote, author }
    })
    .filter((item): item is TestimonialItem => Boolean(item))

  return parsed.length > 0 ? parsed : FALLBACK_ITEMS
}

export function DynamicTestimonials({ data }: DynamicTestimonialsProps) {
  const title = data.title?.trim() || "THE VERDICT"
  const items = normalizeItems(data.items).slice(0, 6)

  return (
    <section className="bg-[#F7F7F5] py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-black">
            {title}
          </p>
          <div className="mt-2 h-[2px] w-40 menu-color-line" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={`${item.author}-${index}`}
              className="border-2 border-black bg-white p-5"
            >
              <p className="text-sm leading-relaxed text-black/80">"{item.quote}"</p>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#E70009]">
                {item.author}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
