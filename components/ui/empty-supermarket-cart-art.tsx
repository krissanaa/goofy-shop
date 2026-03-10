"use client"

import { cn } from "@/lib/utils"

interface EmptySupermarketCartArtProps {
  className?: string
  colorful?: boolean
}

export function EmptySupermarketCartArt({
  className,
  colorful = true,
}: EmptySupermarketCartArtProps) {
  const palette = colorful
    ? {
        basketTop: "#FF6F61",
        basketSide: "#E84C3D",
        basketFront: "#FF8A80",
        frame: "#3A3A3A",
        frameLight: "#6A6A6A",
        wheelOuter: "#2B2B2B",
        wheelInner: "#F5F5F5",
        accent: "#FBD000",
        shadow: "#D7D7D7",
      }
    : {
        basketTop: "#9B9B9B",
        basketSide: "#7A7A7A",
        basketFront: "#B5B5B5",
        frame: "#3A3A3A",
        frameLight: "#6A6A6A",
        wheelOuter: "#2B2B2B",
        wheelInner: "#F5F5F5",
        accent: "#D0D0D0",
        shadow: "#E2E2E2",
      }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 420"
      width="100%"
      height="100%"
      className={cn("h-full w-full", className)}
    >
      <style>
        {`
          .cart-shadow {
            transform-origin: 250px 350px;
            animation: cart-shadow 2.6s ease-in-out infinite;
          }
          .cart-main {
            transform-origin: 250px 240px;
            animation: cart-float 2.6s ease-in-out infinite;
          }
          .cart-wheel {
            animation: cart-wheel-spin 1.25s linear infinite;
          }
          .basket-lines {
            animation: basket-pulse 2.6s ease-in-out infinite;
          }
          @keyframes cart-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
          }
          @keyframes cart-shadow {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(0.88); opacity: 0.62; }
          }
          @keyframes cart-wheel-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes basket-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.72; }
          }
        `}
      </style>

      <ellipse cx="250" cy="350" rx="145" ry="28" fill={palette.shadow} className="cart-shadow" />

      <g className="cart-main">
        <path
          d="M105 95 L155 95 L183 245 L352 245 L390 145 L175 145"
          fill="none"
          stroke={palette.frame}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M110 116 L145 116"
          fill="none"
          stroke={palette.frameLight}
          strokeWidth="7"
          strokeLinecap="round"
        />

        <polygon points="184,146 350,146 333,224 198,224" fill={palette.basketFront} />
        <polygon points="184,146 350,146 363,132 196,132" fill={palette.basketTop} />
        <polygon points="350,146 363,132 346,210 333,224" fill={palette.basketSide} />

        <g className="basket-lines" stroke={palette.frameLight} strokeWidth="4">
          <line x1="214" y1="148" x2="202" y2="223" />
          <line x1="244" y1="148" x2="237" y2="223" />
          <line x1="274" y1="148" x2="272" y2="223" />
          <line x1="304" y1="148" x2="307" y2="223" />
          <line x1="334" y1="148" x2="342" y2="223" />
        </g>

        <circle cx="220" cy="294" r="34" fill={palette.wheelOuter} />
        <circle cx="320" cy="294" r="34" fill={palette.wheelOuter} />

        <g className="cart-wheel" transform="translate(220 294)">
          <circle r="16" fill={palette.wheelInner} />
          <line x1="-12" y1="0" x2="12" y2="0" stroke={palette.frame} strokeWidth="3" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke={palette.frame} strokeWidth="3" />
        </g>
        <g className="cart-wheel" transform="translate(320 294)">
          <circle r="16" fill={palette.wheelInner} />
          <line x1="-12" y1="0" x2="12" y2="0" stroke={palette.frame} strokeWidth="3" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke={palette.frame} strokeWidth="3" />
        </g>

        <circle cx="176" cy="245" r="8" fill={palette.accent} />
      </g>
    </svg>
  )
}
