import { z } from "zod";

export const productListQuerySchema = z.object({
  category: z.string().optional(),
  priceMin: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined)),
  priceMax: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined)),
  inStock: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional().default("newest"),
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? Math.min(Math.max(Number(value), 1), 100) : 24)),
});

export const cartCreateSchema = z.object({
  cartId: z.string().optional(),
});

export const cartItemCreateSchema = z.object({
  cartId: z.string(),
  variantId: z.string(),
  qty: z.number().int().min(1).max(20),
  dropEventId: z.string().optional(),
});

export const cartItemUpdateSchema = z.object({
  qty: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  cartId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  idempotencyKey: z.string().min(8).max(128),
});

export const dropEnterSchema = z.object({
  userAgent: z.string().optional(),
  fingerprint: z.string().optional(),
});

export const dropReserveSchema = z.object({
  variantId: z.string(),
  qty: z.number().int().min(1).max(5),
  entryToken: z.string().optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export const dropReleaseSchema = z.object({
  reservationId: z.string(),
});

export const dropCheckoutSchema = z.object({
  reservationId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  idempotencyKey: z.string().min(8).max(128),
});

export const adminProductCreateSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(2),
  description: z.string().optional(),
  brand: z.string().optional(),
  isDropProduct: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
});

export const adminProductUpdateSchema = adminProductCreateSchema.partial();

export const adminVariantCreateSchema = z.object({
  productId: z.string(),
  sku: z.string().min(2),
  title: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  onHand: z.number().int().min(0).default(0),
  price: z.number().int().min(0),
  currency: z.string().length(3).default("USD"),
});

export const adminVariantUpdateSchema = z.object({
  title: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  price: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
});

export const inventoryAdjustSchema = z.object({
  variantId: z.string(),
  delta: z.number().int().min(-100000).max(100000),
  reason: z.enum([
    "RECEIPT",
    "PURCHASE",
    "CANCELED_ORDER",
    "REFUND",
    "DAMAGE",
    "MANUAL_CORRECTION",
    "DROP_RELEASE",
  ]),
  notes: z.string().max(500).optional(),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FULFILLING", "SHIPPED", "COMPLETED", "CANCELED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
  reason: z.string().optional(),
});

export const adminDropCreateSchema = z.object({
  slug: z.string().min(3),
  name: z.string().min(2),
  description: z.string().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  queueEnabled: z.boolean().default(true),
  rule: z.object({
    maxUnitsPerUser: z.number().int().min(1).default(1),
    reservationTtlMinutes: z.number().int().min(1).max(60).default(5),
    cartTimeoutMinutes: z.number().int().min(1).max(60).default(5),
    queueEnabled: z.boolean().default(true),
    botProtectionEnabled: z.boolean().default(true),
  }),
  variants: z
    .array(
      z.object({
        variantId: z.string(),
        allocation: z.number().int().min(1),
        perUserLimit: z.number().int().min(1).optional(),
      }),
    )
    .min(1),
});

export const adminDropUpdateSchema = adminDropCreateSchema.partial();
