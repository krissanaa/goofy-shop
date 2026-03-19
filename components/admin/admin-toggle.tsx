"use client"

import { useEffect, useState } from "react"

interface AdminToggleProps {
  name?: string
  label?: string
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function AdminToggle({
  name,
  label,
  description,
  checked,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
}: AdminToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = typeof checked === "boolean"
  const value = isControlled ? checked : internalChecked

  useEffect(() => {
    if (isControlled) {
      setInternalChecked(checked)
    }
  }, [checked, isControlled])

  const toggle = () => {
    if (disabled) {
      return
    }

    const nextValue = !value

    if (!isControlled) {
      setInternalChecked(nextValue)
    }

    onCheckedChange?.(nextValue)
  }

  const control = (
    <>
      {name && value ? <input type="hidden" name={name} value="on" /> : null}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={value}
        disabled={disabled}
        className={`sw ${value ? "on" : ""}`}
        style={{ opacity: disabled ? 0.55 : 1 }}
      />
    </>
  )

  if (!label) {
    return control
  }

  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-lbl">{label}</div>
        {description ? <div className="toggle-sub">{description}</div> : null}
      </div>
      {control}
    </div>
  )
}
