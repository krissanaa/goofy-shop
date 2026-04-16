// @ts-nocheck
import { createHash } from "crypto";
import { prisma } from "@/lib/server/prisma";

const hashPayload = (payload: unknown): string => {
  return createHash("sha256").update(JSON.stringify(payload ?? {})).digest("hex");
};

export const getIdempotentResponse = async (scope: string, key: string) => {
  return prisma.idempotencyKey.findUnique({
    where: {
      scope_key: {
        scope,
        key,
      },
    },
  });
};

export const storeIdempotentResponse = async (params: {
  scope: string;
  key: string;
  payload?: unknown;
  responseCode: number;
  responseBody?: unknown;
  ttlMinutes?: number;
}) => {
  const expiresAt = params.ttlMinutes
    ? new Date(Date.now() + params.ttlMinutes * 60 * 1000)
    : null;

  return prisma.idempotencyKey.upsert({
    where: {
      scope_key: {
        scope: params.scope,
        key: params.key,
      },
    },
    create: {
      scope: params.scope,
      key: params.key,
      requestHash: hashPayload(params.payload),
      responseCode: params.responseCode,
      responseBody: params.responseBody as object | undefined,
      expiresAt: expiresAt ?? undefined,
    },
    update: {
      responseCode: params.responseCode,
      responseBody: params.responseBody as object | undefined,
      expiresAt: expiresAt ?? undefined,
    },
  });
};
