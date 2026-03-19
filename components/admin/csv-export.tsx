"use client"

interface CSVExportProps {
  filename: string
  rows: string[][] | Array<Record<string, unknown>>
  headers?: string[]
  label?: string
}

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`
  }

  return value
}

function normalizeRows(
  rows: CSVExportProps["rows"],
  headers?: string[],
) {
  if (rows.length === 0) {
    return headers ? [headers] : []
  }

  if (Array.isArray(rows[0])) {
    return headers ? [headers, ...(rows as string[][])] : (rows as string[][])
  }

  const objectRows = rows as Array<Record<string, unknown>>
  const resolvedHeaders =
    headers ?? Array.from(new Set(objectRows.flatMap((row) => Object.keys(row))))

  return [
    resolvedHeaders,
    ...objectRows.map((row) =>
      resolvedHeaders.map((header) => {
        const value = row[header]
        return value == null ? "" : String(value)
      }),
    ),
  ]
}

export function CSVExport({
  filename,
  rows,
  headers,
  label = "Export CSV",
}: CSVExportProps) {
  const download = () => {
    const matrix = normalizeRows(rows, headers)
    const csv = matrix
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" className="btn btn-primary" onClick={download}>
      {label}
    </button>
  )
}
