# Technical Challenges

Three engineering problems worth reading about. Each one looks simple on the surface until you think through the edge cases — which is where the interesting decisions happen.

---

## 1. Slot Concurrency: Holding a Seat Without Locking the Row

### The Problem

A paragliding stage has 6 places. Two users open the booking page at the same time. Both see "6 places available." Both add themselves to the cart. Both get a confirmation. Now you have 7 bookings for a 6-person stage — and a very awkward phone call to make.

This is the classic race condition in e-commerce, and it's made worse here by the business model: stages are fully paid online, but finalization only happens when the Stripe webhook fires. The window between "user starts checkout" and "payment confirmed" can be 10 minutes. During that time, the seat needs to be held — but not forever, because users abandon carts.

The naive solution — check availability and create the booking in the same request — doesn't work at scale. Between the SELECT and the INSERT, another request can slip through. You need the reservation to happen atomically with the availability check.

### The Solution

Rather than locking rows with `SELECT FOR UPDATE` (which would require holding a transaction open for the duration of checkout — catastrophic with Supabase connection pooling via pgbouncer), the approach here is a **soft reservation via `CartItem`**.

When a user adds a stage to their cart, a `CartItem` record is created with `expiresAt = now + 1h` and `isExpired = false`. This record acts as a temporary hold. Availability is calculated dynamically as:

```
available_places = stage.places - confirmed_bookings - active_cart_items
```

where `active_cart_items` counts only records with `expiresAt > now AND isExpired = false`. Every call to `checkAvailability()` starts by purging expired items from the DB, then reads a consistent count. The full implementation is in [`apps/backoffice/src/lib/availability.ts`](../apps/backoffice/src/lib/availability.ts).

```typescript
// Cleanup expired reservations first, then count
await prisma.cartItem.deleteMany({
  where: { stageId, expiresAt: { lte: now }, isExpired: false },
});

const temporaryCartItems = await prisma.cartItem.count({
  where: { stageId, expiresAt: { gt: now }, isExpired: false },
});

const availablePlaces = stage.places - confirmedBookings - temporaryCartItems;
```

### The Trade-offs

This design is **eventually consistent**, not serializably isolated. A brief window exists between the availability check and the `CartItem` insert where a concurrent request could read the same count and both succeed. In practice, this window is sub-millisecond under normal load, and the business cost of an occasional double-booking is lower than the operational cost of distributed locks on a Supabase-hosted database.

The alternative — PostgreSQL advisory locks (`pg_try_advisory_lock`) — would guarantee serializability but introduces lock contention, requires connection pinning (incompatible with pgbouncer in transaction mode), and adds significant complexity for a scenario that happens maybe twice a season on a 6-person stage. The pragmatic call was to accept the theoretical race condition and monitor for it rather than over-engineer the solution.

One genuine limitation: if two requests arrive within the same millisecond for the last available seat, both could succeed. The real safeguard is the `StageBooking` unique constraint — if something slips through, the final booking step will fail cleanly rather than silently.

**Tests:** [`apps/backoffice/src/__tests__/availability.test.ts`](../apps/backoffice/src/__tests__/availability.test.ts) — covers stage full, pending cart items reducing availability, batch availability check for calendar display.

---

## 2. Stripe Webhook Idempotency: Processing Events Exactly Once

### The Problem

Stripe's documentation is honest about something most payment integrations ignore: **webhooks are delivered at least once, not exactly once**. Network timeouts, retries, and Stripe's own redundancy mean that `payment_intent.succeeded` for a given payment can arrive 2, 3, or more times at your endpoint. If your handler is not idempotent, you finalize the same order multiple times — creating duplicate `StageBooking` records, sending the customer three confirmation emails, and corrupting your reporting data.

The subtler problem is concurrent delivery: Stripe can send the same event twice within milliseconds of each other, hitting two separate serverless function instances simultaneously. A simple "check if already processed, then process" pattern doesn't work here — both instances read "not processed" before either has finished writing.

### The Solution

The solution is to **make the idempotency check itself atomic**, using a unique database constraint as the synchronization primitive.

Every incoming webhook immediately attempts to create a `ProcessedWebhookEvent` record with the Stripe event ID as a unique key:

```typescript
try {
  await prisma.processedWebhookEvent.create({
    data: { stripeEventId: event.id, eventType: event.type },
  });
} catch (error: any) {
  if (error.code === "P2002") {
    // Unique constraint violation — event already processed
    return NextResponse.json({ received: true, message: "Event already processed" });
  }
  throw error;
}
```

If the insert succeeds, this instance "wins" and proceeds to finalize the order. If it fails with `P2002` (Prisma's unique constraint error code), another instance already handled it — return 200 immediately, do nothing. No race condition is possible here because the uniqueness guarantee is enforced by PostgreSQL's index, not by application-level logic. The full handler is in [`apps/backoffice/src/app/api/webhooks/stripe/route.ts`](../apps/backoffice/src/app/api/webhooks/stripe/route.ts).

A second idempotency layer exists inside `handlePaymentSuccess()`: before creating bookings and sending emails, the handler checks whether the order is already in `PAID` or `PARTIALLY_PAID` status. This defends against a different failure mode — the webhook was processed but the `ProcessedWebhookEvent` insert was rolled back (unlikely with Supabase, but theoretically possible in a crash scenario).

### The Trade-offs

Using the unique constraint as a mutex means the first writer wins unconditionally. There's no retry logic if the "winning" instance crashes partway through order finalization — you'd end up with a `ProcessedWebhookEvent` record but no completed order. In production, this would warrant a reconciliation job that periodically checks for `ProcessedWebhookEvent` records with no corresponding `PAID` order. For this project, the manual fallback is the Stripe dashboard, which shows payment status independently of our DB.

An alternative pattern — wrapping the entire handler in a database transaction with `SERIALIZABLE` isolation — was considered and rejected. Transactions in pgbouncer's transaction pooling mode have well-known gotchas (connection can be reused between queries), and a long-running transaction holding a row lock while waiting for Stripe API calls would be a reliability hazard.

**Tests:** [`apps/backoffice/src/__tests__/stripe-webhook.test.ts`](../apps/backoffice/src/__tests__/stripe-webhook.test.ts) — covers duplicate event (P2002 path), missing signature, missing `orderId` in metadata, payment failed flow, and unexpected DB errors.

---

## 3. Payment Allocation: Splitting One Payment Across Multiple Line Items

### The Problem

A customer books two participants on a stage. Each participant's slot costs €350 with a €100 deposit (acompte) due online and €250 balance (solde) due on-site. The customer pays €200 at checkout. Simple enough — but now a promo code knocks €30 off the total. How much of that €30 comes from participant A's deposit, and how much from participant B's? And when the admin dashboard shows "remaining balance for this booking," what number should it display?

The problem compounds with gift vouchers, which are full-price items (no deposit split), and with manual payments recorded by admins after the fact. You need a data model that can represent any payment against any subset of line items, track the running balance on each, and remain queryable without joining through five tables every time.

### The Solution

The solution separates **what was paid** (the `Payment` record) from **what it covers** (the `PaymentAllocation` join table). Every payment — whether from Stripe or entered manually by an admin — creates one `Payment` record and N `PaymentAllocation` records, one per `OrderItem` it covers, with an `allocatedAmount` for each.

The allocation algorithm runs at webhook time, after a successful payment is confirmed:

```typescript
// Sum all effective deposit amounts as the proportional base
let totalBase = orderItems.reduce((sum, item) =>
  sum + (item.effectiveDepositAmount ?? item.depositAmount ?? 0), 0
);

for (const item of orderItems) {
  const itemBase = item.effectiveDepositAmount ?? item.depositAmount ?? 0;
  const allocatedAmount = Math.round(
    (payment.amount * (itemBase / totalBase)) * 100
  ) / 100;

  await prisma.paymentAllocation.create({
    data: { paymentId: payment.id, orderItemId: item.id, allocatedAmount },
  });
}
```

The `effectiveDepositAmount` field is the deposit after promo code discount. It's calculated at order creation time in [`apps/backoffice/src/features/orders/server/handlers/create-order.ts`](../apps/backoffice/src/features/orders/server/handlers/create-order.ts): the total promo discount is distributed across line items proportionally to their full price, then subtracted from each item's deposit amount. Rounding errors are assigned entirely to the last item to ensure exact totals.

### Why This Model

The alternative — storing a single `amountPaid` counter on `OrderItem` and incrementing it — is simpler to write but miserable to audit. You lose the history of which payment covered which amount, you can't trace a refund back to specific allocations, and you can't display a meaningful payment timeline in the admin dashboard. The join table is three columns (`paymentId`, `orderItemId`, `allocatedAmount`) and a unique constraint — the overhead is minimal relative to the flexibility it provides.

The `unique([paymentId, orderItemId])` constraint does double duty: it prevents accidental double-allocation (if the webhook fires twice and the first idempotency layer somehow fails), and it makes the "what does this payment cover" query a simple indexed lookup rather than a full table scan.

One deliberate simplification: the allocation is calculated once at payment time and never recalculated. If an admin later applies a manual discount to an OrderItem (via `finalDiscountAmount`), the existing allocations are not retroactively adjusted — the discount is recorded as a separate field and subtracted at display time. This keeps the allocation history immutable and auditable.

**Tests:** [`apps/backoffice/src/__tests__/order-processing.test.ts`](../apps/backoffice/src/__tests__/order-processing.test.ts) — covers deposit/remaining totals, promo discount distribution, multi-item summation, and edge cases where discount exceeds deposit amount (clamped to zero).
