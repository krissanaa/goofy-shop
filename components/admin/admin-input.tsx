import type { CSSProperties, InputHTMLAttributes } from "react"

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  wrapperStyle?: CSSProperties
}

export function AdminInput({
  label,
  error,
  required,
  className,
  wrapperStyle,
  ...props
}: AdminInputProps) {
  const input = (
    <input
      {...props}
      required={required}
      aria-invalid={Boolean(error)}
      className={["fi", className].filter(Boolean).join(" ")}
    />
  )

  if (!label) {
    return input
  }

  return (
    <label className="form-group" style={wrapperStyle}>
      <div className="form-label">
        {label}
        {required ? <em>*</em> : null}
      </div>
      {input}
      {error ? <div className="t-danger">{error}</div> : null}
    </label>
  )
}
