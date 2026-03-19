"use client"

import { useEffect, useMemo, useRef, useState } from "react"

interface ImageUploadProps {
  name: string
  label?: string
  multiple?: boolean
  accept?: string
  maxFiles?: number
  existingUrls?: string[]
  helperText?: string
}

export function ImageUpload({
  name,
  label = "Upload Images",
  multiple = false,
  accept = "image/*",
  maxFiles = 6,
  existingUrls = [],
  helperText,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [previews])

  const syncFileList = (nextFiles: File[]) => {
    setFiles(nextFiles)

    if (!inputRef.current) {
      return
    }

    const dataTransfer = new DataTransfer()
    nextFiles.forEach((file) => dataTransfer.items.add(file))
    inputRef.current.files = dataTransfer.files
  }

  const appendFiles = (incomingFiles: File[]) => {
    const merged = multiple
      ? [...files, ...incomingFiles].slice(0, maxFiles)
      : incomingFiles.slice(0, 1)
    syncFileList(merged)
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          appendFiles(Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/")))
        }}
      >
        <div className="upload-txt">{label}</div>
        <div className="upload-sub">
          {helperText ?? `Drag & drop or click to choose up to ${maxFiles} image files`}
        </div>
        <input
          ref={inputRef}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
          onChange={(event) => appendFiles(Array.from(event.target.files ?? []))}
        />
      </label>

      {existingUrls.length > 0 || previews.length > 0 ? (
        <div className="img-thumbs">
          {existingUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt="Existing upload"
              className="img-thumb"
              style={{ objectFit: "cover" }}
            />
          ))}
          {previews.map((preview, index) => (
            <div key={preview} style={{ position: "relative" }}>
              <img
                src={preview}
                alt={`Selected upload ${index + 1}`}
                className="img-thumb"
                style={{ objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => syncFileList(files.filter((_, fileIndex) => fileIndex !== index))}
                className="btn"
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  padding: "2px 6px",
                  fontSize: 8,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
