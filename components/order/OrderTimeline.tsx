"use client"

import { motion } from "framer-motion"
import { getTrackingStepIndex, type TrackedOrderStatus } from "@/lib/order"

const TIMELINE_STEPS = [
  {
    label: "Pending",
    description: "Order placed",
  },
  {
    label: "Processing",
    description: "Payment confirmed",
  },
  {
    label: "Shipped",
    description: "On the way",
  },
  {
    label: "Delivered",
    description: "Completed",
  },
]

interface OrderTimelineProps {
  status: TrackedOrderStatus
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentStep = getTrackingStepIndex(status)

  return (
    <div className="space-y-5">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.24 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  isCurrent
                    ? "border-[var(--gold)] bg-[var(--gold)]"
                    : isCompleted
                      ? "border-[var(--white)] bg-[var(--white)]"
                      : "border-white/24 bg-transparent"
                }`}
              />
              {index < TIMELINE_STEPS.length - 1 ? (
                <span className="mt-2 h-10 w-px bg-[var(--bordw)]" />
              ) : null}
            </div>

            <div className="pb-2">
              <p
                className={`goofy-display text-[30px] leading-none ${
                  isCurrent
                    ? "text-[var(--gold)]"
                    : isCompleted
                      ? "text-[var(--white)]"
                      : "text-white/35"
                }`}
              >
                {step.label}
              </p>
              <p className="mt-1 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/34">
                {step.description}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
