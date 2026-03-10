import { NextRequest } from "next/server";
import { ZodTypeAny, z } from "zod";
import { ApiError } from "@/lib/server/errors";

export const parseBody = async <T extends ZodTypeAny>(request: NextRequest, schema: T): Promise<z.infer<T>> => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ApiError(400, "INVALID_REQUEST", "Invalid JSON payload.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, "INVALID_REQUEST", "Validation failed.", parsed.error.flatten());
  }

  return parsed.data;
};

export const parseSearchParams = <T extends ZodTypeAny>(request: NextRequest, schema: T): z.infer<T> => {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = schema.safeParse(query);

  if (!parsed.success) {
    throw new ApiError(400, "INVALID_REQUEST", "Invalid query params.", parsed.error.flatten());
  }

  return parsed.data;
};
