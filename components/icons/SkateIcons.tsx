import type { SVGProps } from "react"

type SkateIconProps = SVGProps<SVGSVGElement> & {
  size?: number
  color?: string
  spinning?: boolean
  hovered?: boolean
}

function IconBase({
  size = 40,
  color = "#F4F0EB",
  className,
  children,
  ...props
}: SkateIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export function SkateDeckIcon({ color, ...props }: SkateIconProps) {
  return (
    <IconBase color={color} {...props}>
      <rect x="12" y="22" width="40" height="20" rx="10" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="48" r="4" fill={color} />
      <circle cx="44" cy="48" r="4" fill={color} />
    </IconBase>
  )
}

export function WheelIcon({ color, ...props }: SkateIconProps) {
  return (
    <IconBase color={color} {...props}>
      <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="2" />
      <circle cx="32" cy="32" r="7" stroke={color} strokeWidth="2" />
      <path d="M32 14v10M50 32H40M32 50V40M14 32h10" stroke={color} strokeWidth="2" />
    </IconBase>
  )
}

export function TruckIcon({ color, ...props }: SkateIconProps) {
  return (
    <IconBase color={color} {...props}>
      <path d="M16 22h32" stroke={color} strokeWidth="2" />
      <path d="M24 22v10h16V22" stroke={color} strokeWidth="2" />
      <path d="M18 32h28" stroke={color} strokeWidth="2" />
      <circle cx="22" cy="42" r="4" stroke={color} strokeWidth="2" />
      <circle cx="42" cy="42" r="4" stroke={color} strokeWidth="2" />
    </IconBase>
  )
}

export function BearingIcon({ color, ...props }: SkateIconProps) {
  return (
    <IconBase color={color} {...props}>
      <circle cx="32" cy="32" r="18" stroke={color} strokeWidth="2" />
      <circle cx="32" cy="32" r="6" stroke={color} strokeWidth="2" />
      <circle cx="32" cy="18" r="2" fill={color} />
      <circle cx="46" cy="32" r="2" fill={color} />
      <circle cx="32" cy="46" r="2" fill={color} />
      <circle cx="18" cy="32" r="2" fill={color} />
    </IconBase>
  )
}

export function ShoeIcon({ color, ...props }: SkateIconProps) {
  return (
    <IconBase color={color} {...props}>
      <path
        d="M16 38c6 0 9-8 12-13 3 4 8 8 18 10v7H16v-4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 44h30" stroke={color} strokeWidth="2" />
      <path d="M28 31h6M31 28h5" stroke={color} strokeWidth="2" />
    </IconBase>
  )
}

export function ApparelIcon({ color, ...props }: SkateIconProps) {
  return (
    <IconBase color={color} {...props}>
      <path
        d="M22 18h20l8 8-7 8-4-4v18H25V30l-4 4-7-8 8-8Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  )
}
