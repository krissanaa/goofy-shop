import { Press_Start_2P, VT323 } from "next/font/google"
import { cn } from "@/lib/utils"
import styles from "./products-hero-scene.module.css"

type MarqueeSpeed = "slow" | "normal" | "fast"

interface ProductsHeroSceneProps {
  className?: string
  showBorder?: boolean
  showMarquee?: boolean
  marqueeItems?: string[]
  marqueeBackgroundColor?: string
  marqueeTextColor?: string
  marqueeSpeed?: MarqueeSpeed
  signLogoUrl?: string | null
  signLogoAlt?: string
}

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start-2p",
})

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
})

function PixelCloud({
  className,
  width,
  height,
}: {
  className: string
  width: number
  height: number
}) {
  return (
    <svg
      className={cn(styles.cloud, className)}
      width={width}
      height={height}
      viewBox="0 0 14 6"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="10" height="2" fill="#fff" />
      <rect x="4" y="3" width="7" height="1" fill="#fff" />
      <rect x="5" y="2" width="5" height="1" fill="#fff" />
      <rect x="6" y="1" width="3" height="1" fill="#fff" />
      <rect x="1" y="4" width="1" height="1" fill="#fff" />
      <rect x="12" y="4" width="1" height="1" fill="#fff" />
      <rect x="2" y="5" width="10" height="1" fill="rgba(0,0,0,0.07)" />
    </svg>
  )
}

export function ProductsHeroScene({
  className,
  showBorder = true,
  showMarquee = false,
  marqueeItems = [],
  marqueeBackgroundColor = "#000000",
  marqueeTextColor = "#FFFFFF",
  marqueeSpeed = "normal",
  signLogoUrl = null,
  signLogoAlt = "Sign logo",
}: ProductsHeroSceneProps) {
  const items = marqueeItems.filter((item) => typeof item === "string" && item.trim().length > 0)
  const repeatedItems = [...items, ...items, ...items, ...items]
  const speedClass =
    marqueeSpeed === "slow"
      ? "animate-marquee-slow"
      : marqueeSpeed === "fast"
        ? "animate-marquee-fast"
        : "animate-marquee"

  return (
    <section
      className={cn(
        pressStart.variable,
        vt323.variable,
        styles.root,
        showBorder ? styles.withBorder : null,
        className,
      )}
    >
      {showMarquee && repeatedItems.length > 0 ? (
        <div
          className={styles.marqueeBar}
          style={{ backgroundColor: marqueeBackgroundColor }}
          aria-label="Promotions"
        >
          <div className={cn("flex whitespace-nowrap", speedClass, styles.marqueeTrack)}>
            {repeatedItems.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className={styles.marqueeItem}
                style={{ color: marqueeTextColor }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.pixelHero}>
        <PixelCloud className={styles.cloudA} width={112} height={48} />
        <PixelCloud className={styles.cloudB} width={160} height={68} />
        <PixelCloud className={styles.cloudC} width={128} height={54} />

        <div className={styles.titleBox}>
          <div className={styles.tag}>* NEW DROP AVAILABLE *</div>
          <div className={styles.t1}>OUR</div>
          <div className={styles.t2}>
            PRODUCTS
            <span className={styles.blink} style={{ color: "#FBD000" }}>
              _
            </span>
          </div>
          <div className={styles.sub}>GOOFY SHOP - LIMITED STOCK - GRAB IT FAST</div>
          <span className={styles.cornerBl} />
          <span className={styles.cornerBr} />
        </div>

        <div className={styles.scene}>
          <div className={styles.groundRow}>
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={`brick-${index}`} className={styles.brickCell} />
            ))}
          </div>

          <div className={styles.skaterWrap} aria-hidden="true">
            <div className={styles.trail}>
              <div className={styles.trailDot1} />
              <div className={styles.trailDot2} />
              <div className={styles.trailDot3} />
              <div className={styles.trailDot4} />
            </div>

            <div className={styles.sparks}>
              <div className={cn(styles.sp, styles.sp1)} />
              <div className={cn(styles.sp, styles.sp2)} />
              <div className={cn(styles.sp, styles.sp3)} />
              <div className={cn(styles.sp, styles.sp4)} />
              <div className={cn(styles.sp, styles.sp5)} />
            </div>

            <div className={styles.board}>
              <svg width="64" height="14" viewBox="0 0 16 4" className={styles.pixelSvg}>
                <rect x="1" y="0" width="14" height="3" fill="#CC8844" />
                <rect x="1" y="0" width="14" height="1" fill="#555" />
                <rect x="0" y="1" width="1" height="1" fill="#AA6622" />
                <rect x="15" y="1" width="1" height="1" fill="#AA6622" />
                <rect x="3" y="1" width="2" height="1" fill="#E70009" />
                <rect x="11" y="1" width="2" height="1" fill="#E70009" />
                <rect x="5" y="1" width="6" height="1" fill="#FBD000" />
                <rect x="7" y="0" width="2" height="1" fill="#6B8CFF" />
                <rect x="2" y="2" width="3" height="1" fill="#999" />
                <rect x="11" y="2" width="3" height="1" fill="#999" />
                <rect x="2" y="3" width="2" height="1" fill="#E70009" />
                <rect x="12" y="3" width="2" height="1" fill="#E70009" />
              </svg>
            </div>

            <div className={styles.skaterBody}>
              <svg width="56" height="60" viewBox="0 0 14 15" className={styles.pixelSvg}>
                <rect x="4" y="0" width="6" height="1" fill="#E70009" />
                <rect x="5" y="0" width="4" height="1" fill="#FBD000" />
                <rect x="3" y="1" width="8" height="2" fill="#E70009" />
                <rect x="3" y="2" width="8" height="1" fill="#CC0000" />
                <rect x="3" y="3" width="8" height="5" fill="#FFCC88" />
                <rect x="2" y="4" width="1" height="3" fill="#FFCC88" />
                <rect x="11" y="4" width="1" height="3" fill="#FFCC88" />
                <rect x="4" y="3" width="2" height="1" fill="#332200" />
                <rect x="8" y="3" width="2" height="1" fill="#332200" />
                <rect x="4" y="4" width="2" height="2" fill="#fff" />
                <rect x="8" y="4" width="2" height="2" fill="#fff" />
                <rect x="5" y="5" width="1" height="1" fill="#1A1A2E" />
                <rect x="9" y="5" width="1" height="1" fill="#1A1A2E" />
                <rect x="4" y="4" width="1" height="1" fill="#DDD" />
                <rect x="8" y="4" width="1" height="1" fill="#DDD" />
                <rect x="6" y="6" width="2" height="1" fill="#E8AA70" />
                <rect x="5" y="7" width="4" height="1" fill="#CC4422" />
                <rect x="8" y="7" width="1" height="1" fill="#FFAA88" />
                <rect x="6" y="8" width="2" height="1" fill="#FFCC88" />
                <rect x="3" y="9" width="8" height="4" fill="#1A1A2E" />
                <rect x="3" y="9" width="8" height="1" fill="#252545" />
                <rect x="0" y="9" width="3" height="2" fill="#1A1A2E" />
                <rect x="11" y="8" width="3" height="2" fill="#1A1A2E" />
                <rect x="0" y="10" width="3" height="1" fill="#FBD000" />
                <rect x="11" y="9" width="3" height="1" fill="#FBD000" />
                <rect x="5" y="10" width="4" height="2" fill="#E70009" />
                <rect x="6" y="10" width="2" height="1" fill="#FF2222" />
                <rect x="0" y="11" width="1" height="1" fill="#FFCC88" />
                <rect x="13" y="8" width="1" height="1" fill="#FFCC88" />
                <rect x="3" y="13" width="3" height="2" fill="#333" />
                <rect x="8" y="13" width="3" height="2" fill="#333" />
                <rect x="3" y="13" width="8" height="1" fill="#444" />
                <rect x="6" y="13" width="2" height="1" fill="#FBD000" />
                <rect x="2" y="14" width="4" height="1" fill="#F0F0F0" />
                <rect x="8" y="14" width="4" height="1" fill="#F0F0F0" />
                <rect x="2" y="14" width="4" height="1" fill="#E70009" />
                <rect x="8" y="14" width="4" height="1" fill="#E70009" />
              </svg>
            </div>
          </div>

          <div className={styles.signWrap} aria-hidden="true">
            <div className={styles.signBack} />
            <div className={styles.signBoard}>
              <div className={styles.barTop} />
              <div className={styles.barBot} />
              <div className={styles.stripeL} />
              <div className={styles.stripeR} />
              <div className={cn(styles.bolt, styles.boltTl)} />
              <div className={cn(styles.bolt, styles.boltTr)} />
              <div className={cn(styles.bolt, styles.boltBl)} />
              <div className={cn(styles.bolt, styles.boltBr)} />
              {signLogoUrl ? (
                <img src={signLogoUrl} alt={signLogoAlt} className={styles.signLogoImage} />
              ) : (
                <div className={styles.signLogo}>
                  YOUR
                  <br />
                  LOGO
                </div>
              )}
            </div>
            <div className={styles.signPost} />
            <div className={styles.signPostBase} />
          </div>
        </div>
      </div>
    </section>
  )
}
