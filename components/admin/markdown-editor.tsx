"use client"

import { useState } from "react"

interface MarkdownEditorProps {
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
  rows?: number
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

function renderMarkdown(value: string) {
  const lines = value.split(/\r?\n/)
  const blocks: string[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(`<ul>${listItems.join("")}</ul>`)
      listItems = []
    }
  }

  for (const line of lines) {
    if (!line.trim()) {
      flushList()
      continue
    }

    if (line.startsWith("- ")) {
      listItems.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`)
      continue
    }

    flushList()

    if (line.startsWith("### ")) {
      blocks.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`)
    } else if (line.startsWith("## ")) {
      blocks.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`)
    } else if (line.startsWith("# ")) {
      blocks.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`)
    } else {
      blocks.push(`<p>${renderInlineMarkdown(line)}</p>`)
    }
  }

  flushList()
  return blocks.join("")
}

export function MarkdownEditor({
  name,
  label = "Content",
  defaultValue = "",
  required = false,
  rows = 12,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue)
  const [mode, setMode] = useState<"WRITE" | "PREVIEW">("WRITE")

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{label}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className={`ftab ${mode === "WRITE" ? "active" : ""}`}
            onClick={() => setMode("WRITE")}
          >
            Write
          </button>
          <button
            type="button"
            className={`ftab ${mode === "PREVIEW" ? "active" : ""}`}
            onClick={() => setMode("PREVIEW")}
          >
            Preview
          </button>
        </div>
      </div>
      <div className="card-body">
        {mode === "WRITE" ? (
          <textarea
            name={name}
            required={required}
            rows={rows}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="ft"
          />
        ) : (
          <>
            <textarea
              name={name}
              required={required}
              value={value}
              readOnly
              style={{ display: "none" }}
            />
            <div
              className="ft"
              style={{ minHeight: 240 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || "<p>No content yet.</p>" }}
            />
          </>
        )}
      </div>
    </div>
  )
}
