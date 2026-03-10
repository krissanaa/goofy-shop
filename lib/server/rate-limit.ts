import { ApiError } from "@/lib/server/errors";

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export const applyRateLimit = (key: string, limit: number, windowMs: number): void => {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket) {
    buckets.set(key, { count: 1, windowStart: now });
    return;
  }

  if (now - bucket.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return;
  }

  if (bucket.count >= limit) {
    throw new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again shortly.");
  }

  bucket.count += 1;
};
