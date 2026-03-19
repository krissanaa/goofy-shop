"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export function TrackOrderForm() {
  const router = useRouter()
  const [suffix, setSuffix] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalized = suffix.trim().toUpperCase()
    if (!normalized) {
      return
    }

    const orderNumber = normalized.startsWith("GFW-")
      ? normalized
      : `GFW-${normalized.replace(/^GFW-?/i, "")}`

    router.push(`/order/${orderNumber}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl border border-[var(--bordw)] bg-white/[0.02] p-6 md:p-8">
      <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
        Track Order
      </p>
      <h1 className="mt-4 goofy-display text-[clamp(42px,6vw,72px)] leading-none text-[var(--white)]">
        Find Your Order
      </h1>
      <p className="mt-4 goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/36">
        Enter the order number after the GFW- prefix.
      </p>

      <div className="mt-8 flex items-stretch overflow-hidden border border-[var(--bordw)]">
        <span className="flex items-center border-r border-[var(--bordw)] px-4 goofy-mono text-[11px] uppercase tracking-[0.18em] text-white/42">
          GFW-
        </span>
        <input
          value={suffix}
          onChange={(event) =>
            setSuffix(
              event.target.value
                .replace(/\s+/g, "")
                .replace(/^GFW-?/i, ""),
            )
          }
          placeholder="023"
          className="h-14 w-full bg-transparent px-4 goofy-mono text-[12px] uppercase tracking-[0.16em] text-[var(--white)] outline-none placeholder:text-white/18"
        />
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex h-12 items-center justify-center bg-[var(--gold)] px-6 goofy-display text-[24px] uppercase text-[var(--black)] transition-colors hover:bg-[var(--white)]"
      >
        Track Order
      </button>
    </form>
  )
}
