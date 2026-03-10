"use client"

import { useId, useState } from "react"
import { cn } from "@/lib/utils"

interface EmptyCartBoxArtProps {
  className?: string
  interactive?: boolean
  colorful?: boolean
  boxOnly?: boolean
  loopFlaps?: boolean
}

export function EmptyCartBoxArt({
  className,
  interactive = false,
  colorful = false,
  boxOnly = false,
  loopFlaps = false,
}: EmptyCartBoxArtProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const uid = useId().replace(/:/g, "")

  const ids = {
    boxFront: `boxFront-${uid}`,
    boxRight: `boxRight-${uid}`,
    cartPlat: `cartPlat-${uid}`,
    checkGrad: `checkGrad-${uid}`,
  }

  const colors = colorful
    ? {
        boxFrontStart: "#FFE082",
        boxFrontEnd: "#F9A825",
        boxRightStart: "#FFCC80",
        boxRightEnd: "#EF6C00",
        cartPlatStart: "#64B5F6",
        cartPlatEnd: "#1565C0",
        checkStart: "#81C784",
        checkEnd: "#2E7D32",
        checkStroke: "#1B5E20",
        wheel: "#263238",
        wheelInner: "#111827",
        bodyTop: "#5C6BC0",
        bodyLeft: "#3949AB",
        bodyRight: "#283593",
        arm: "#42A5F5",
        armTip: "#1E88E5",
        flapLeft: "#FFE082",
        flapRight: "#FFB74D",
        flapTop: "#FFD54F",
        flapBottom: "#FFF3E0",
        tapeA: "#E53935",
        tapeB: "#C62828",
        shadow: "#D1D5DB",
      }
    : {
        boxFrontStart: "#E3C5A0",
        boxFrontEnd: "#C99A67",
        boxRightStart: "#EED4B5",
        boxRightEnd: "#BF8A57",
        cartPlatStart: "#7C7C7C",
        cartPlatEnd: "#4D4D4D",
        checkStart: "#FFB74D",
        checkEnd: "#F57C00",
        checkStroke: "#E65100",
        wheel: "#424242",
        wheelInner: "#212121",
        bodyTop: "#AC7C49",
        bodyLeft: "#8A5F34",
        bodyRight: "#724A25",
        arm: "#9E9E9E",
        armTip: "#757575",
        flapLeft: "#E5C7A2",
        flapRight: "#D7AE80",
        flapTop: "#D2A06A",
        flapBottom: "#F2DEC7",
        tapeA: "#D9A73C",
        tapeB: "#BD8E2F",
        shadow: "#D8D8D8",
      }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 450"
      width="100%"
      height="100%"
      className={cn(
        "h-full w-full",
        interactive ? "cursor-pointer" : undefined,
        loopFlaps ? "is-looping" : undefined,
        isAnimating ? "is-animating" : undefined,
        className,
      )}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? "Toggle box animation" : undefined}
      onClick={
        interactive
          ? (event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsAnimating((current) => !current)
            }
          : undefined
      }
    >
      <defs>
        <linearGradient id={ids.boxFront} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.boxFrontStart} />
          <stop offset="100%" stopColor={colors.boxFrontEnd} />
        </linearGradient>
        <linearGradient id={ids.boxRight} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.boxRightStart} />
          <stop offset="100%" stopColor={colors.boxRightEnd} />
        </linearGradient>
        <linearGradient id={ids.cartPlat} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.cartPlatStart} />
          <stop offset="100%" stopColor={colors.cartPlatEnd} />
        </linearGradient>
        <linearGradient id={ids.checkGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.checkStart} />
          <stop offset="100%" stopColor={colors.checkEnd} />
        </linearGradient>

        <style>
          {`
            .box-flap { transform-origin: center; transition: transform 0.6s ease-in-out, opacity 0.6s ease; }
            .box-flap-left { transform-origin: 170px 190px; }
            .box-flap-right { transform-origin: 330px 190px; }
            .box-flap-top { transform-origin: 250px 150px; }
            .box-flap-bottom { transform-origin: 250px 230px; }
            .tape { stroke-dasharray: 150; stroke-dashoffset: 150; opacity: 0; transition: all 0.5s ease; }
            .box-group { transform-origin: 250px 250px; transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.4s ease; }
            .checkmark-group { transform-origin: 250px 200px; transform: scale(0) translateY(40px); opacity: 0; transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.4s ease; }
            .shadow { transition: transform 0.6s ease; transform-origin: 250px 330px; }
            svg:hover:not(.is-animating) .box-group { transform: translateY(-5px); }
            svg:hover:not(.is-animating) .shadow { transform: scale(0.95); opacity: 0.8; }
            .is-looping .box-group { animation: box-bob-loop 2.8s ease-in-out infinite; }
            .is-looping .box-flap-left { animation: flap-left-loop 2.8s ease-in-out infinite; }
            .is-looping .box-flap-right { animation: flap-right-loop 2.8s ease-in-out infinite; }
            .is-looping .box-flap-top { animation: flap-top-loop 2.8s ease-in-out infinite; }
            .is-looping .box-flap-bottom { animation: flap-bottom-loop 2.8s ease-in-out infinite; }
            .is-looping .shadow { animation: shadow-loop 2.8s ease-in-out infinite; }
            @keyframes box-bob-loop {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            @keyframes flap-left-loop {
              0%, 100% { transform: none; opacity: 1; }
              42%, 62% { transform: rotateY(70deg) skewY(10deg) translateX(-14px); opacity: 1; }
            }
            @keyframes flap-right-loop {
              0%, 100% { transform: none; opacity: 1; }
              42%, 62% { transform: rotateY(-70deg) skewY(-10deg) translateX(14px); opacity: 1; }
            }
            @keyframes flap-top-loop {
              0%, 100% { transform: none; opacity: 1; }
              42%, 62% { transform: rotateX(-70deg) scaleY(0.88) translateY(-18px); opacity: 1; }
            }
            @keyframes flap-bottom-loop {
              0%, 100% { transform: none; opacity: 1; }
              42%, 62% { transform: rotateX(52deg) scaleY(0.94) translateY(10px); opacity: 1; }
            }
            @keyframes shadow-loop {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(0.88); opacity: 0.72; }
            }
            .is-animating .box-flap-left { transform: rotateY(180deg) skewY(30deg) scaleX(0); opacity: 0; transition-delay: 0.1s; }
            .is-animating .box-flap-right { transform: rotateY(-180deg) skewY(-30deg) scaleX(0); opacity: 0; transition-delay: 0.2s; }
            .is-animating .box-flap-top { transform: rotateX(-180deg) scaleY(0); opacity: 0; transition-delay: 0.3s; }
            .is-animating .box-flap-bottom { transform: rotateX(180deg) scaleY(0); opacity: 0; transition-delay: 0.4s; }
            .is-animating .tape { stroke-dashoffset: 0; opacity: 1; transition-delay: 1s; transition-duration: 0.4s; }
            .is-animating .box-group { transform: scale(0.4) translateY(100px); opacity: 0; transition-delay: 1.8s; }
            .is-animating .checkmark-group { transform: scale(1) translateY(0); opacity: 1; transition-delay: 2s; }
          `}
        </style>
      </defs>

      <ellipse cx="250" cy="370" rx="120" ry="25" fill={colors.shadow} className="shadow" />

      {!boxOnly ? (
        <g id="cart">
          <ellipse cx="170" cy="340" rx="10" ry="15" fill={colors.wheel} />
          <ellipse cx="330" cy="340" rx="10" ry="15" fill={colors.wheel} />
          <ellipse cx="250" cy="360" rx="12" ry="18" fill={colors.wheelInner} />
          <polygon points="250,330 130,270 250,210 370,270" fill={`url(#${ids.cartPlat})`} />
          <polygon points="130,270 250,330 250,345 130,285" fill={colors.bodyLeft} />
          <polygon points="250,330 370,270 370,285 250,345" fill={colors.bodyRight} />
          <path
            d="M360,265 L410,210 L410,130"
            fill="none"
            stroke={colors.arm}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M410,130 L380,115"
            fill="none"
            stroke={colors.armTip}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      <g className="box-group">
        <polygon points="250,230 170,190 250,150 330,190" fill={colors.bodyTop} />
        <polygon points="250,280 170,240 170,190 250,230" fill={`url(#${ids.boxFront})`} />
        <polygon points="250,280 330,240 330,190 250,230" fill={`url(#${ids.boxRight})`} />
        <polygon
          className="box-flap box-flap-left"
          points="170,190 120,165 180,125 250,150"
          fill={colors.flapLeft}
        />
        <polygon
          className="box-flap box-flap-right"
          points="330,190 380,165 320,125 250,150"
          fill={colors.flapRight}
        />
        <polygon
          className="box-flap box-flap-top"
          points="250,150 200,125 260,85 330,125"
          fill={colors.flapTop}
        />
        <polygon
          className="box-flap box-flap-bottom"
          points="250,230 180,265 250,305 320,265"
          fill={colors.flapBottom}
        />

        <polygon points="250,280 170,240 170,190 250,230" fill={`url(#${ids.boxFront})`} />
        <polygon points="250,280 330,240 330,190 250,230" fill={`url(#${ids.boxRight})`} />

        {!boxOnly ? (
          <>
            <path
              className="tape"
              d="M190,190 L250,220 L310,190"
              fill="none"
              stroke={colors.tapeA}
              strokeWidth="16"
              strokeLinejoin="miter"
              strokeLinecap="square"
            />
            <path
              className="tape"
              d="M250,220 L250,250"
              fill="none"
              stroke={colors.tapeB}
              strokeWidth="16"
              strokeLinecap="square"
            />
          </>
        ) : null}
      </g>

      {!boxOnly ? (
        <g className="checkmark-group">
          <polygon
            points="220,230 250,260 320,160 300,140 250,210 230,190"
            fill="#9E9E9E"
            transform="translate(0, 15)"
          />
          <polygon
            points="220,230 250,260 320,160 300,140 250,210 230,190"
            fill="#757575"
            transform="translate(10, 10)"
          />
          <polygon
            points="220,230 250,260 320,160 300,140 250,210 230,190"
            fill={`url(#${ids.checkGrad})`}
            stroke={colors.checkStroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      ) : null}
    </svg>
  )
}
