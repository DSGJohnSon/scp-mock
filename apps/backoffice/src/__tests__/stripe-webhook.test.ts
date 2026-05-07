/**
 * stripe-webhook.test.ts
 *
 * Unit tests for POST /api/webhooks/stripe (src/app/api/webhooks/stripe/route.ts).
 *
 * Covered:
 *  - Missing / invalid Stripe signature → 400
 *  - Duplicate event (Prisma P2002) → 200 already-processed response
 *  - Unhandled event type → 200 received: true
 *  - payment_intent.payment_failed → payment FAILED + order CANCELLED
 *  - payment_intent.succeeded with no orderId → early return (no DB writes)
 *  - Unexpected DB error during processing → 500
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock is hoisted — use vi.hoisted() for variables referenced inside the factory
const { mockConstructEvent, mockHeaders, mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    processedWebhookEvent: { create: vi.fn(), findUnique: vi.fn() },
    order: { findUnique: vi.fn(), update: vi.fn() },
    payment: { findUnique: vi.fn(), update: vi.fn() },
    client: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    paymentAllocation: { findMany: vi.fn() },
  };
  return {
    mockConstructEvent: vi.fn(),
    mockHeaders: vi.fn(),
    mockPrisma,
  };
});

vi.mock("next/headers", () => ({ headers: mockHeaders }));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: { webhooks: { constructEvent: mockConstructEvent } },
}));

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));

vi.mock("@/lib/order-processing", () => ({
  finalizeOrder: vi.fn(),
  allocatePaymentToOrderItems: vi.fn(),
}));

import { POST } from "@/app/api/webhooks/stripe/route";

// ---- helpers -------------------------------------------------------------

function makeRequest(body = "raw-stripe-body") {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
  });
}

function setHeadersSig(signature: string | null) {
  mockHeaders.mockResolvedValue({ get: vi.fn().mockReturnValue(signature) });
}

// ---- tests ---------------------------------------------------------------

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when the stripe-signature header is absent", async () => {
    setHeadersSig(null);
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    expect((res as any).body).toMatchObject({ error: "No signature provided" });
  });

  it("returns 400 when Stripe signature verification fails", async () => {
    setHeadersSig("bad-sig");
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Signature mismatch");
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    expect((res as any).body).toMatchObject({ error: "Invalid signature" });
  });

  it("returns 200 with 'already processed' for a duplicate event (P2002)", async () => {
    setHeadersSig("valid-sig");
    mockConstructEvent.mockReturnValue({
      id: "evt_dup",
      type: "customer.created",
      data: { object: {} },
    });
    const p2002 = Object.assign(new Error("Unique violation"), { code: "P2002" });
    mockPrisma.processedWebhookEvent.create.mockRejectedValue(p2002);
    mockPrisma.processedWebhookEvent.findUnique.mockResolvedValue({
      stripeEventId: "evt_dup",
      processedAt: new Date(),
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect((res as any).body).toMatchObject({
      received: true,
      message: "Event already processed",
    });
  });

  it("returns 200 received:true for unhandled event types", async () => {
    setHeadersSig("valid-sig");
    mockConstructEvent.mockReturnValue({
      id: "evt_unknown",
      type: "invoice.paid",
      data: { object: {} },
    });
    mockPrisma.processedWebhookEvent.create.mockResolvedValue({});
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect((res as any).body).toMatchObject({ received: true });
  });

  it("marks payment FAILED and order CANCELLED on payment_intent.payment_failed", async () => {
    setHeadersSig("valid-sig");
    mockConstructEvent.mockReturnValue({
      id: "evt_fail",
      type: "payment_intent.payment_failed",
      data: { object: { id: "pi_failed", metadata: { orderId: "order-abc" } } },
    });
    mockPrisma.processedWebhookEvent.create.mockResolvedValue({});
    mockPrisma.payment.update.mockResolvedValue({ id: "pay_1", status: "FAILED" });
    mockPrisma.order.update.mockResolvedValue({ id: "order-abc", status: "CANCELLED" });

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(mockPrisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "FAILED" } }),
    );
    expect(mockPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "CANCELLED" } }),
    );
  });

  it("skips order DB queries when payment_intent.succeeded has no orderId in metadata", async () => {
    setHeadersSig("valid-sig");
    mockConstructEvent.mockReturnValue({
      id: "evt_no_order",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_xyz", metadata: {} } },
    });
    mockPrisma.processedWebhookEvent.create.mockResolvedValue({});

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled();
  });

  it("returns 500 when an unexpected error escapes event processing", async () => {
    setHeadersSig("valid-sig");
    mockConstructEvent.mockReturnValue({
      id: "evt_err",
      type: "customer.created",
      data: { object: {} },
    });
    mockPrisma.processedWebhookEvent.create.mockRejectedValue(
      new Error("DB connection lost"),
    );

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });
});
