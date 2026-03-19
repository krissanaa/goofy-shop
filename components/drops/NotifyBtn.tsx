"use client"

import { useMemo, useState, useTransition } from "react"
import { LoaderCircle } from "lucide-react"
import { notifySignup } from "@/lib/actions/notifyActions"

type NotifyState = "idle" | "submitting" | "done" | "already_signed"

interface NotifyBtnProps {
  dropId: string
  className?: string
}

function getButtonClassName(state: NotifyState) {
  switch (state) {
    case "done":
      return "border-[var(--gold)] bg-[var(--gold)] text-[var(--black)]"
    case "already_signed":
      return "border-white/12 bg-white/6 text-white/45"
    case "submitting":
      return "border-white/16 bg-transparent text-[var(--white)]"
    case "idle":
    default:
      return "border-white/18 bg-transparent text-[var(--white)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
  }
}

export function NotifyBtn({ dropId, className = "" }: NotifyBtnProps) {
  const [contact, setContact] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<NotifyState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const buttonLabel = useMemo(() => {
    switch (state) {
      case "done":
        return "✓ You're on the list!"
      case "already_signed":
        return "✓ Already registered"
      case "submitting":
        return "Submitting..."
      case "idle":
      default:
        return "Notify Me When It Drops"
    }
  }, [state])

  const handleSubmit = () => {
    const trimmed = contact.trim()
    if (!trimmed) {
      setError("Enter a phone number or email.")
      return
    }

    if (!trimmed.includes("@") && trimmed.replace(/\D/g, "").length < 8) {
      setError("Enter a valid phone number or email.")
      return
    }

    setError(null)
    setState("submitting")

    startTransition(async () => {
      try {
        const response = await notifySignup({
          drop_id: dropId,
          email: trimmed.includes("@") ? trimmed : undefined,
          phone: trimmed.includes("@") ? undefined : trimmed,
        })

        setState(response.status)
        setIsOpen(response.status === "done" ? false : true)

        if (response.status === "done") {
          setContact("")
        }
      } catch (submitError) {
        setState("idle")
        setError(
          submitError instanceof Error ? submitError.message : "Unable to save your reminder.",
        )
      }
    })
  }

  return (
    <div className={`w-full max-w-[320px] ${className}`.trim()}>
      <button
        type="button"
        disabled={state === "done" || state === "already_signed" || isPending}
        onClick={() => {
          if (state === "done" || state === "already_signed") {
            return
          }

          setIsOpen((current) => !current)
        }}
        className={`goofy-mono inline-flex w-full items-center justify-center border px-5 py-3 text-[9px] uppercase tracking-[0.18em] transition-colors ${getButtonClassName(state)}`}
      >
        {state === "submitting" ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            <span>{buttonLabel}</span>
          </span>
        ) : (
          buttonLabel
        )}
      </button>

      {isOpen ? (
        <div className="mt-3 border border-[var(--bordw)] bg-[var(--black)]/92 p-3">
          <label className="goofy-mono block text-[8px] uppercase tracking-[0.18em] text-white/35">
            Phone or Email
          </label>
          <input
            type="text"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder="85620xxxxxxx or you@email.com"
            className="mt-2 h-11 w-full border border-[var(--bordw)] bg-transparent px-3 goofy-mono text-[10px] tracking-[0.08em] text-[var(--white)] outline-none transition-colors placeholder:text-white/18 focus:border-[var(--gold)]"
          />
          {error ? (
            <p className="mt-2 goofy-mono text-[8px] uppercase tracking-[0.14em] text-rose-300">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-3 inline-flex w-full items-center justify-center bg-[var(--gold)] px-4 py-3 goofy-mono text-[9px] uppercase tracking-[0.18em] text-[var(--black)] transition-colors hover:bg-[var(--white)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Sending..." : "Get Notified"}
          </button>
        </div>
      ) : null}
    </div>
  )
}
