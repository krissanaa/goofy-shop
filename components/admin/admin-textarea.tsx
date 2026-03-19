import type { CSSProperties, ReactNode, TextareaHTMLAttributes } from "react"

interface AdminTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  description?: ReactNode
  wrapperStyle?: CSSProperties
}

export function AdminTextarea({
  label,
  error,
  description,
  required,
  className,
  wrapperStyle,
  ...props
}: AdminTextareaProps) {
  const textarea = (
    <textarea
      {...props}
      required={required}
      aria-invalid={Boolean(error)}
      className={["ft", className].filter(Boolean).join(" ")}
    />
  )

  if (!label) {
    return textarea
  }

  return (
    <label className="form-group" style={wrapperStyle}>
      <div className="form-label">
        {label}
        {required ? <em>*</em> : null}
      </div>
      {description ? <div className="toggle-sub">{description}</div> : null}
      {textarea}
      {error ? <div className="t-danger">{error}</div> : null}
    </label>
  )
}
