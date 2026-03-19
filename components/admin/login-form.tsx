"use client"

import { useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { loginAction, requestPasswordResetAction } from "@/app/admin/login/actions"
import { ThemeToggle } from "@/components/admin/theme-toggle"
import { INITIAL_ACTION_STATE } from "@/lib/admin"

export function LoginForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_ACTION_STATE)
  const [resetState, resetAction, isResetPending] = useActionState(
    requestPasswordResetAction,
    INITIAL_ACTION_STATE,
  )
  const lastMessageRef = useRef<string | undefined>(undefined)
  const lastResetMessageRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!state.message || state.message === lastMessageRef.current) {
      return
    }

    lastMessageRef.current = state.message

    if (state.status === "error") {
      toast.error(state.message)
      return
    }

    if (state.status === "success") {
      toast.success(state.message)
      router.replace(state.redirectTo || "/admin")
    }
  }, [router, state])

  useEffect(() => {
    if (!resetState.message || resetState.message === lastResetMessageRef.current) {
      return
    }

    lastResetMessageRef.current = resetState.message

    if (resetState.status === "error") {
      toast.error(resetState.message)
      return
    }

    toast.success(resetState.message)
  }, [resetState])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-[1280px] items-center px-6 py-12">
        <div className="grid w-full gap-4 lg:grid-cols-[1fr_420px]">
          <section className="card hidden lg:flex lg:flex-col lg:justify-between">
            <div className="card-body">
              <div className="sidebar-logo !border-b-0 !px-0 !py-0">
                <div>
                  <div className="logo-text">GOOFY.</div>
                  <div className="logo-badge">Admin</div>
                </div>
                <ThemeToggle compact />
              </div>
              <div className="mt-10">
                <div className="page-eyebrow">Overview</div>
                <div className="page-title text-[72px] leading-[0.9]">Control Room</div>
                <div className="page-sub mt-4 max-w-md">
                  Protected access for orders, inventory, product publishing, and back-office operations.
                </div>
              </div>
            </div>
            <div className="card-header">
              <div className="card-title">Live from Vientiane</div>
              <div className="badge b-active">System Online</div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div>
                <div className="page-eyebrow">Admin Login</div>
                <div className="page-title">Sign In</div>
                <div className="page-sub">Supabase email/password session required</div>
              </div>
              <div className="lg:hidden">
                <ThemeToggle compact />
              </div>
            </div>
            <div className="card-body">
              <form action={formAction} className="space-y-5">
                <label className="form-group">
                  <span className="form-label">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Password</span>
                  <input
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    className="fi"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Signing In..." : "Enter Admin"}
                </button>
              </form>

              <div className="mt-8 border-t border-[var(--border)] pt-5">
                <div className="card-title">Forgot Password</div>
                <div className="page-sub mt-2">Send a Supabase reset email</div>
                <form action={resetAction} className="mt-4 space-y-4">
                  <label className="form-group">
                    <span className="form-label">Reset Email</span>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      className="fi"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isResetPending}
                    className="btn inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResetPending ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
