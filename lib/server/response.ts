import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/server/errors";

export const ok = <T>(data: T, init?: ResponseInit) => {
  return NextResponse.json({ data }, init);
};

export const fail = (error: ApiError) => {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? undefined,
      },
    },
    { status: error.status },
  );
};

export const withApiHandler = <A extends unknown[]>(handler: (...args: A) => Promise<Response>) => {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (isApiError(error)) {
        return fail(error);
      }

      console.error("[api] unhandled error", error);
      return fail(new ApiError(500, "INTERNAL_ERROR", "Unexpected error occurred."));
    }
  };
};
