import Link from "next/link"

import { FC, FT } from "@/components/home/homepage-shared"

export function StickyNav() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 mix-blend-difference md:px-10 md:py-5">
            <Link href="/" className="text-[16px] uppercase text-white md:text-[18px]" style={{ fontFamily: FT }}>
                Goofy
            </Link>
            <div className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.15em] text-white/60 md:flex" style={{ fontFamily: FC }}>
                <span>First skate shop in Laos.</span>
                <span>Vientiane</span>
            </div>
            <button className="text-[12px] font-bold uppercase tracking-[0.1em] text-white md:text-[13px]" style={{ fontFamily: FC }}>
                Menu +
            </button>
        </header>
    )
}
