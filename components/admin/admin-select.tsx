import type { CSSProperties, ReactNode, SelectHTMLAttributes } from "react"

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
  wrapperStyle?: CSSProperties
}

export function AdminSelect({
  label,
  error,
  required,
  children,
  className,
  wrapperStyle,
  ...props
}: AdminSelectProps) {
  const select = (
    <select
      {...props}
      required={required}
      aria-invalid={Boolean(error)}
      className={["fs", className].filter(Boolean).join(" ")}
    >
      {children}
    </select>
  )

  if (!label) {
    return select
  }

  return (
    <label className="form-group" style={wrapperStyle}>
      <div className="form-label">
        {label}
        {required ? <em>*</em> : null}
      </div>
      {select}
      {error ? <div className="t-danger">{error}</div> : null}
    </label>
  )
}
