"use client"

import Image from "next/image"
import { ChangeEvent, useMemo, useState } from "react"
import { Loader2, Upload } from "lucide-react"
import { updateOrderSlip } from "@/lib/actions/orderActions"
import { supabase } from "@/lib/supabase"

interface SlipUploadClientProps {
  orderId: string
  orderNumber: string
  currentSlipUrl?: string | null
  onUploaded?: (slipUrl: string) => void
}

export function SlipUploadClient({
  orderId,
  orderNumber,
  currentSlipUrl,
  onUploaded,
}: SlipUploadClientProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentSlipUrl ?? null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const isBusy = uploading

  const previewImage = useMemo(() => previewUrl ?? null, [previewUrl])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setMessage(null)
    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const path = `${orderNumber}-${Date.now()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from("slips")
        .upload(path, file, {
          upsert: true,
          contentType: file.type || undefined,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data } = supabase.storage.from("slips").getPublicUrl(path)
      const publicUrl = data.publicUrl

      const result = await updateOrderSlip(orderId, orderNumber, publicUrl)
      if (!result.ok) {
        setError(result.message || "Unable to save payment slip.")
        return
      }

      setPreviewUrl(publicUrl)
      setMessage("Slip submitted! We'll verify within 24 hours.")
      onUploaded?.(publicUrl)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload payment slip.",
      )
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-[var(--bordw)] px-5 py-8 text-center transition-colors hover:border-[var(--gold)]">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/6 text-[var(--gold)]">
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </span>
        <div>
          <p className="goofy-display text-[28px] leading-none text-[var(--white)]">
            Upload Slip
          </p>
          <p className="mt-2 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/38">
            JPG, PNG, or WEBP
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isBusy}
          onChange={handleFileChange}
        />
      </label>

      {previewImage ? (
        <div className="overflow-hidden border border-[var(--bordw)] bg-[#111]">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={previewImage}
              alt={`${orderNumber} slip preview`}
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="goofy-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="goofy-mono text-[9px] uppercase tracking-[0.16em] text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  )
}
