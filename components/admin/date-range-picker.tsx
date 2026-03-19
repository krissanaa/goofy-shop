"use client"

import { useState } from "react"
import { FilterTabs } from "@/components/admin/filter-tabs"

interface DateRangePreset {
  value: string
  label: string
  href?: string
}

interface DateRangePickerProps {
  presets: DateRangePreset[]
  activeValue: string
  from?: string
  to?: string
  onPresetChange?: (value: string) => void
  onApply?: (values: { from: string; to: string }) => void
}

export function DateRangePicker({
  presets,
  activeValue,
  from = "",
  to = "",
  onPresetChange,
  onApply,
}: DateRangePickerProps) {
  const [fromValue, setFromValue] = useState(from)
  const [toValue, setToValue] = useState(to)

  return (
    <div>
      <FilterTabs tabs={presets} activeValue={activeValue} onChange={onPresetChange} />
      {activeValue === "CUSTOM" ? (
        <div className="filter-bar">
          <input
            className="fi"
            type="date"
            value={fromValue}
            onChange={(event) => setFromValue(event.target.value)}
            style={{ width: 180 }}
          />
          <input
            className="fi"
            type="date"
            value={toValue}
            onChange={(event) => setToValue(event.target.value)}
            style={{ width: 180 }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onApply?.({ from: fromValue, to: toValue })}
          >
            Apply Range
          </button>
        </div>
      ) : null}
    </div>
  )
}
