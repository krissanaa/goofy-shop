# Goofy Shop Backend Architecture (Next.js + Prisma + Postgres)

This document is the implementation blueprint for the backend layer of Goofy Shop.

## 1) Prisma schema

Location: `prisma/schema.prisma`

Highlights:
- Full commerce entities: users, products, variants, inventory, carts, orders, payments, shipments.
- Drop engine entities: `DropEvent`, `DropRule`, `DropVariant`, `DropEntry`, `StockReservation`.
- Security/compliance entities: `AuditLog`, `RiskEvent`, `IdempotencyKey`.
- Auth entities for NextAuth: `Account`, `Session`, `VerificationToken`.
- Required constraints and indexes:
  - Unique SKU: `ProductVariant.sku @unique`.
  - Inventory fields: `onHand`, `reserved`, `available`.
  - Order status enum includes `PENDING`, `PAID`, `FULFILLING`, `SHIPPED`, `COMPLETED`, `CANCELED`, `REFUNDED`.
  - Index coverage for SKU, `userId`, `orderId`, `createdAt`, `dropEventId`.

## 2) API route contracts (App Router Route Handlers)

Base: `app/api/**/route.ts`

### Customer APIs

`GET /api/products`
- Query:
```json
{
  "category": "apparel",
  "priceMin": 5000,
  "priceMax": 15000,
  "inStock": true,
  "search": "hoodie",
  "sort": "newest",
  "cursor": "prod_01",
  "limit": 24
}
```
- Response:
```json
{
  "data": {
    "items": [
      {
        "id": "prod_123",
        "slug": "void-hoodie",
        "name": "Void Hoodie",
        "variants": [
          {
            "id": "var_1",
            "sku": "VH-BLK-M",
            "available": 8,
            "price": 14800,
            "currency": "USD"
          }
        ],
        "media": [
          { "url": "https://cdn.example.com/vh-1.jpg", "type": "IMAGE" }
        ]
      }
    ],
    "nextCursor": "prod_124"
  }
}
```

`GET /api/products/[slug]`
- Response:
```json
{
  "data": {
    "id": "prod_123",
    "slug": "void-hoodie",
    "name": "Void Hoodie",
    "description": "Heavyweight drop fit",
    "categories": ["Apparel"],
    "variants": [
      {
        "id": "var_1",
        "sku": "VH-BLK-M",
        "size": "M",
        "color": "Black",
        "available": 8,
        "price": 14800,
        "currency": "USD"
      }
    ]
  }
}
```

`POST /api/cart`
- Request:
```json
{
  "cartId": "optional-existing-cart-id"
}
```
- Response:
```json
{
  "data": {
    "id": "cart_123",
    "status": "ACTIVE",
    "currency": "USD",
    "expiresAt": "2026-02-19T12:00:00.000Z"
  }
}
```

`POST /api/cart/items`
- Request:
```json
{
  "cartId": "cart_123",
  "variantId": "var_1",
  "qty": 1,
  "dropEventId": "drop_1"
}
```
- Response:
```json
{
  "data": {
    "itemId": "item_1",
    "reservationId": "res_1",
    "reservationExpiresAt": "2026-02-19T12:05:00.000Z"
  }
}
```

`PATCH /api/cart/items/[id]`
- Request:
```json
{
  "qty": 2
}
```
- Response:
```json
{
  "data": {
    "itemId": "item_1",
    "qty": 2,
    "reservationId": "res_2"
  }
}
```

`DELETE /api/cart/items/[id]`
- Response:
```json
{
  "data": {
    "deleted": true,
    "releasedReservationId": "res_2"
  }
}
```

`POST /api/checkout`
- Request:
```json
{
  "cartId": "cart_123",
  "successUrl": "https://shop.example.com/checkout/success",
  "cancelUrl": "https://shop.example.com/checkout/cancel",
  "idempotencyKey": "checkout-cart_123-v1"
}
```
- Response:
```json
{
  "data": {
    "orderId": "ord_1",
    "orderNumber": "GS-20260219-0001",
    "checkoutSessionId": "cs_test_123",
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_123"
  }
}
```

`POST /api/webhooks/stripe`
- Request: Stripe event payload + `stripe-signature` header.
- Response:
```json
{
  "received": true
}
```

`GET /api/orders`
- Response:
```json
{
  "data": {
    "items": [
      {
        "id": "ord_1",
        "orderNumber": "GS-20260219-0001",
        "status": "PAID",
        "grandTotal": 16420,
        "createdAt": "2026-02-19T11:20:00.000Z"
      }
    ]
  }
}
```

`GET /api/orders/[id]`
- Response:
```json
{
  "data": {
    "id": "ord_1",
    "status": "SHIPPED",
    "items": [
      {
        "sku": "VH-BLK-M",
        "qty": 1,
        "unitPrice": 14800
      }
    ],
    "payment": {
      "status": "SUCCEEDED",
      "checkoutSessionId": "cs_test_123"
    },
    "shipment": {
      "status": "IN_TRANSIT",
      "trackingNumber": "1Z999"
    }
  }
}
```

### Drop engine APIs

`GET /api/drops/active`
- Response:
```json
{
  "data": {
    "id": "drop_1",
    "slug": "capsule-feb-2026",
    "startsAt": "2026-02-19T12:00:00.000Z",
    "endsAt": "2026-02-19T13:00:00.000Z",
    "queueEnabled": true
  }
}
```

`POST /api/drops/[id]/enter`
- Request:
```json
{
  "userAgent": "Mozilla/5.0",
  "fingerprint": "fp_abc"
}
```
- Response:
```json
{
  "data": {
    "entryToken": "qe_123",
    "status": "WAITING",
    "queuePosition": 104
  }
}
```

`POST /api/drops/[id]/reserve`
- Request:
```json
{
  "variantId": "var_1",
  "qty": 1,
  "entryToken": "qe_123",
  "idempotencyKey": "drop-reserve-u1-var1-v1"
}
```
- Response:
```json
{
  "data": {
    "reservationId": "res_44",
    "expiresAt": "2026-02-19T12:05:00.000Z"
  }
}
```

`POST /api/drops/[id]/release`
- Request:
```json
{
  "reservationId": "res_44"
}
```
- Response:
```json
{
  "data": {
    "released": true
  }
}
```

`POST /api/drops/[id]/checkout`
- Request:
```json
{
  "reservationId": "res_44",
  "successUrl": "https://shop.example.com/drop/success",
  "cancelUrl": "https://shop.example.com/drop/cancel",
  "idempotencyKey": "drop-checkout-res44-v1"
}
```
- Response:
```json
{
  "data": {
    "orderId": "ord_55",
    "checkoutSessionId": "cs_test_999",
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_999"
  }
}
```

### Admin APIs (RBAC: STAFF/ADMIN or ADMIN)

`POST /api/admin/products`
- Request:
```json
{
  "slug": "night-cargo",
  "name": "Night Cargo",
  "description": "Ripstop cargo",
  "isDropProduct": false,
  "categoryIds": ["cat_1"]
}
```
- Response:
```json
{
  "data": { "id": "prod_444" }
}
```

`PATCH /api/admin/products/[id]`
- Request: partial product fields.
- Response: updated product snapshot.

`POST /api/admin/variants`
- Request:
```json
{
  "productId": "prod_444",
  "sku": "NC-BLK-32",
  "size": "32",
  "color": "Black",
  "onHand": 200,
  "price": 12800,
  "currency": "USD"
}
```

`PATCH /api/admin/variants/[id]`
- Request: partial variant + price updates.

`POST /api/admin/inventory/adjust`
- Request:
```json
{
  "variantId": "var_1",
  "delta": -5,
  "reason": "MANUAL_CORRECTION",
  "notes": "Cycle count adjustment"
}
```

`POST /api/admin/csv/import`
- Request: multipart file upload + dry-run flag.
- Response:
```json
{
  "data": {
    "processed": 100,
    "createdProducts": 20,
    "createdVariants": 80,
    "errors": []
  }
}
```

`GET /api/admin/orders`
- Query: `status`, `from`, `to`, `userId`, `dropEventId`, cursor pagination.

`PATCH /api/admin/orders/[id]/status`
- Request:
```json
{
  "status": "SHIPPED",
  "trackingNumber": "1Z999"
}
```

`POST /api/admin/drops`
- Request:
```json
{
  "slug": "capsule-feb-2026",
  "name": "Capsule Feb 2026",
  "startsAt": "2026-02-19T12:00:00.000Z",
  "endsAt": "2026-02-19T13:00:00.000Z",
  "queueEnabled": true,
  "rule": {
    "maxUnitsPerUser": 1,
    "reservationTtlMinutes": 5,
    "cartTimeoutMinutes": 5,
    "botProtectionEnabled": true
  },
  "variants": [
    { "variantId": "var_1", "allocation": 300, "perUserLimit": 1 }
  ]
}
```

`PATCH /api/admin/drops/[id]`
- Request: partial drop/rule/variant updates.

`GET /api/admin/analytics`
- Response:
```json
{
  "data": {
    "revenue": { "today": 0, "last7d": 0, "last30d": 0 },
    "orders": { "pending": 0, "paid": 0, "shipped": 0 },
    "conversion": { "addToCart": 0, "checkoutStart": 0, "purchase": 0 }
  }
}
```

### Standard error envelope

```json
{
  "error": {
    "code": "SOLD_OUT",
    "message": "This size is sold out."
  }
}
```

Drop-specific error codes:
- `SOLD_OUT`
- `LIMIT_EXCEEDED`
- `DROP_NOT_STARTED`
- `RESERVATION_EXPIRED`
- `QUEUE_REQUIRED`

## 3) Core business logic pseudocode

### A) Inventory reservation

#### `reserveStock(variantId, qty, userId, ttlMinutes, opts?)`

```text
function reserveStock(variantId, qty, userId, ttlMinutes, opts):
  validate qty > 0
  now = current time
  expiresAt = now + ttlMinutes

  in transaction:
    lock inventory row for variantId (SELECT ... FOR UPDATE)
    inv = get inventory by variantId
    if inv missing: throw SOLD_OUT

    releaseExpiredReservationsForVariant(variantId, now)  // optional, same transaction
    inv = reload inventory row after release

    if inv.available < qty: throw SOLD_OUT

    newReserved = inv.reserved + qty
    newAvailable = inv.onHand - newReserved
    update inventory set reserved = newReserved, available = newAvailable

    reservation = create StockReservation(
      variantId, userId, qty, status=ACTIVE, expiresAt, dropEventId?, idempotencyKey?
    )

    return reservation
```

#### `commitStock(orderId)`

```text
function commitStock(orderId):
  in transaction:
    reservations = find ACTIVE reservations for orderId, not expired
    if none: throw RESERVATION_EXPIRED

    for each reservation in reservations:
      lock inventory row for reservation.variantId
      inv = get inventory row
      if inv.reserved < reservation.qty: throw STOCK_STATE_CORRUPT

      newOnHand = inv.onHand - reservation.qty
      newReserved = inv.reserved - reservation.qty
      newAvailable = newOnHand - newReserved
      if newOnHand < 0: throw SOLD_OUT

      update inventory set onHand, reserved, available
      mark reservation COMMITTED with committedAt now

      write InventoryAdjustment(delta = -qty, reason = PURCHASE, referenceId=orderId)
```

#### `releaseStock(reservationId)`

```text
function releaseStock(reservationId):
  in transaction:
    reservation = find reservation by id FOR UPDATE
    if reservation missing: return no-op
    if reservation.status in [RELEASED, EXPIRED, COMMITTED, CANCELED]: return no-op

    lock inventory row for reservation.variantId
    inv = get inventory row
    releaseQty = min(reservation.qty, inv.reserved)

    newReserved = inv.reserved - releaseQty
    newAvailable = inv.onHand - newReserved
    update inventory set reserved, available

    mark reservation RELEASED with releasedAt now
    write InventoryAdjustment(delta = 0, reason = DROP_RELEASE, referenceId=reservation.id)
```

### B) Checkout flow (Stripe)

```text
POST /api/checkout:
  require auth
  rate limit by user + ip
  enforce idempotency key
  load cart + items + active reservations
  if any reservation expired -> RESERVATION_EXPIRED
  create Order(status=PENDING) + OrderItems in transaction
  create Stripe Checkout Session with orderId in metadata
  create Payment(status=PENDING, checkoutSessionId)
  return checkout URL
```

Webhook handling:

```text
POST /api/webhooks/stripe:
  verify Stripe signature
  deduplicate by event id (idempotency table)

  if event == checkout.session.completed:
    fetch orderId from session.metadata
    in transaction:
      update order status -> PAID, paidAt=now
      update payment status -> SUCCEEDED
      commitStock(orderId)

  if event in [checkout.session.expired, payment_intent.payment_failed]:
    find order from metadata/payment
    in transaction:
      update order status -> CANCELED
      update payment status -> FAILED/EXPIRED
      release all ACTIVE reservations linked to order

  if event in [charge.refunded, charge.refund.updated]:
    update payment/order statuses to REFUNDED flow

  return 200 quickly
```

### C) Drop engine rules

```text
on drop enter:
  if now < drop.startsAt: DROP_NOT_STARTED
  if queueEnabled and no valid entry token: QUEUE_REQUIRED
  run bot checks (velocity/ip/ua)
  create or update DropEntry record

on reserve:
  check drop window active
  enforce per-user limit:
    purchasedQty + activeReservedQty for (user, drop, variant) <= limit
  if exceed -> LIMIT_EXCEEDED
  reserveStock(ttl = DropRule.reservationTtlMinutes)
  return reservation + expiresAt

on drop checkout:
  validate reservation ACTIVE and not expired
  create pending order from reservation
  create Stripe session
```

Drop user-facing errors:
- `SOLD_OUT` -> "This item is sold out."
- `LIMIT_EXCEEDED` -> "Limit reached for this drop."
- `DROP_NOT_STARTED` -> "This drop has not started yet."
- `RESERVATION_EXPIRED` -> "Your reservation expired. Try again."
- `QUEUE_REQUIRED` -> "You need a queue pass to continue."

### D) Risk & fraud detection (lightweight)

```text
function evaluateRisk(userId, ip, userAgent, context):
  now = current time

  attempts2m = count orders/payments by user in last 2 minutes
  failedPayments24h = count FAILED payments by user in last 24h
  distinctCards24h = count distinct payment_method fingerprints in last 24h
  sameIpLimitedDropUsers = count distinct users from same ip purchasing same limited drop

  score = 0
  if attempts2m > threshold: score += 35 + create RiskEvent(CHECKOUT_VELOCITY)
  if distinctCards24h > threshold: score += 25 + create RiskEvent(DISTINCT_CARDS)
  if sameIpLimitedDropUsers > threshold: score += 25 + create RiskEvent(SHARED_IP_LIMITED_DROP)
  if failedPayments24h > threshold: score += 30 + create RiskEvent(FAILED_PAYMENTS)

  if score >= 70:
    action = SOFT_BLOCK for X minutes
  if score >= 90:
    action = REQUIRE_REVIEW

  persist action in RiskEvent + optional block cache
  return action
```

Actions:
- Soft block checkout for configurable duration (e.g., 15 minutes).
- Force manual review for critical score.
- Always persist into `RiskEvent`.

## 4) Suggested backend folder structure

```text
app/
  api/
    auth/[...nextauth]/route.ts
    products/
      route.ts
      [slug]/route.ts
    cart/
      route.ts
      items/route.ts
      items/[id]/route.ts
    checkout/route.ts
    webhooks/stripe/route.ts
    orders/
      route.ts
      [id]/route.ts
    drops/
      active/route.ts
      [id]/enter/route.ts
      [id]/reserve/route.ts
      [id]/release/route.ts
      [id]/checkout/route.ts
    admin/
      products/route.ts
      products/[id]/route.ts
      variants/route.ts
      variants/[id]/route.ts
      inventory/adjust/route.ts
      csv/import/route.ts
      orders/route.ts
      orders/[id]/status/route.ts
      drops/route.ts
      drops/[id]/route.ts
      analytics/route.ts
lib/
  server/
    prisma.ts
    auth.ts
    rbac.ts
    validation.ts
    rate-limit.ts
    idempotency.ts
    stripe.ts
    services/
      inventory.ts
      cart.ts
      checkout.ts
      drops.ts
      orders.ts
      risk.ts
      audit.ts
    repositories/
      product-repo.ts
      order-repo.ts
      inventory-repo.ts
      drop-repo.ts
    errors.ts
    response.ts
prisma/
  schema.prisma
  migrations/
auth.ts
```

## 5) Concurrency and race-condition handling

Use these patterns in all critical flows:

- Inventory row locking:
  - Use SQL row locks (`SELECT ... FOR UPDATE`) inside Prisma transaction before mutating inventory.
- Strict transaction boundaries:
  - Reservation create + inventory reserved update must be one transaction.
  - Commit and release operations must be one transaction each.
- Idempotency:
  - Require `Idempotency-Key` for checkout, drop reserve, webhook event processing.
  - Persist keys in `IdempotencyKey` table.
- Expiration handling:
  - Use `expiresAt` on reservations.
  - On every reserve/checkout attempt, release expired reservations in-line (and via scheduled cleanup job).
- Webhook safety:
  - Verify Stripe signature.
  - Deduplicate event IDs.
  - Keep webhook handler idempotent; repeated events should be no-ops.
- Update guards:
  - Use conditional updates where status transitions matter (e.g., update order only if `status=PENDING`).
- Auditability:
  - Every admin mutation and inventory adjustment writes `AuditLog`.
- Rate limiting:
  - Per user/IP for checkout/drop endpoints to reduce abuse and accidental race floods.
