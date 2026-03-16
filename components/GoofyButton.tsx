"use client"

import Link from "next/link"
import { motion, type HTMLMotionProps } from "framer-motion"
import type { MouseEventHandler, ReactNode } from "react"
import { EASE_SNAP } from "@/lib/motion"

const MotionLink = motion.create(Link)

type ButtonVariant = "white" | "gold" | "outline" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

type CommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type LinkProps = CommonProps & {
  href: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  target?: string
  rel?: string
  ariaLabel?: string
}

type NativeButtonProps = CommonProps &
  Pick<HTMLMotionProps<"button">, "disabled" | "type"> & {
    href?: undefined
    onClick?: MouseEventHandler<HTMLButtonElement>
  }

const VARIANT_CLASS_MAP: Record<ButtonVariant, string> = {
  white: "bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gold)]",
  gold: "bg-[var(--gold)] text-[var(--black)] hover:bg-[var(--white)]",
  outline:
    "border border-[var(--white)] text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--black)]",
  ghost: "text-[var(--white)] underline-offset-4 hover:text-[var(--gold)]",
}

const SIZE_CLASS_MAP: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[8px] tracking-[0.18em]",
  md: "px-5 py-2.5 text-[9px] tracking-[0.18em]",
  lg: "px-7 py-3.5 text-[10px] tracking-[0.18em]",
}

function buildClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return [
    "goofy-mono inline-flex items-center justify-center gap-2 uppercase transition-colors duration-200",
    VARIANT_CLASS_MAP[variant],
    SIZE_CLASS_MAP[size],
    className,
  ]
    .filter(Boolean)
    .join(" ")
}

export function GoofyButton(props: LinkProps | NativeButtonProps) {
  const {
    variant = "white",
    size = "md",
    className,
    children,
  } = props

  const motionProps = {
    whileHover: { scale: 1.03, y: -2 },
    whileTap: { scale: 0.96 },
    transition: { duration: 0.18, ease: EASE_SNAP },
  } as const

  const composedClassName = buildClassName(variant, size, className)

  if ("href" in props && props.href) {
    return (
      <MotionLink
        href={props.href}
        onClick={props.onClick}
        target={props.target}
        rel={props.rel}
        aria-label={props.ariaLabel}
        className={composedClassName}
        {...motionProps}
      >
        {children}
      </MotionLink>
    )
  }

  const buttonProps = props as NativeButtonProps

  return (
    <motion.button
      type={buttonProps.type ?? "button"}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      className={composedClassName}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
}
