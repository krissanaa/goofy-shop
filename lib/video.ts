export function extractYouTubeVideoId(value: string): string | null {
  const input = value.trim()

  if (!input) {
    return null
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input
  }

  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, "").toLowerCase()

    if (host === "youtu.be") {
      const directId = url.pathname.split("/").filter(Boolean)[0]
      return directId && /^[a-zA-Z0-9_-]{11}$/.test(directId) ? directId : null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v")
      if (watchId && /^[a-zA-Z0-9_-]{11}$/.test(watchId)) {
        return watchId
      }

      const pathParts = url.pathname.split("/").filter(Boolean)
      const candidate = pathParts[pathParts.length - 1]

      if (
        pathParts.length >= 2 &&
        ["embed", "shorts", "live", "v"].includes(pathParts[0]) &&
        candidate &&
        /^[a-zA-Z0-9_-]{11}$/.test(candidate)
      ) {
        return candidate
      }
    }
  } catch {
    const match = input.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&/]|$)/)
    return match?.[1] ?? null
  }

  return null
}

export function getYouTubeThumbnailUrl(value: string): string | null {
  const videoId = extractYouTubeVideoId(value)
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
}
