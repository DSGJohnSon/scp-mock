import { describe, it, expect } from "vitest";

// ─── Stages ──────────────────────────────────────────────────────────────────
import {
  CreateStageSchema,
  UpdateStageSchema,
  ApplyStagePromotionSchema,
} from "../features/stages/schemas";

describe("CreateStageSchema", () => {
  const valid = {
    startDate: "2026-06-01",
    duration: 5,
    places: 6,
    moniteurIds: ["moniteur-id-1"],
    price: 680,
    acomptePrice: 150,
    type: "INITIATION",
  };

  it("accepts valid data", () => {
    expect(CreateStageSchema.parse(valid)).toBeTruthy();
  });

  it("rejects invalid date", () => {
    expect(() => CreateStageSchema.parse({ ...valid, startDate: "not-a-date" })).toThrow();
  });

  it("rejects 0 duration", () => {
    expect(() => CreateStageSchema.parse({ ...valid, duration: 0 })).toThrow();
  });

  it("rejects 0 places", () => {
    expect(() => CreateStageSchema.parse({ ...valid, places: 0 })).toThrow();
  });

  it("rejects empty moniteurIds", () => {
    expect(() => CreateStageSchema.parse({ ...valid, moniteurIds: [] })).toThrow();
  });

  it("rejects negative price", () => {
    expect(() => CreateStageSchema.parse({ ...valid, price: -10 })).toThrow();
  });

  it("rejects invalid stage type", () => {
    expect(() => CreateStageSchema.parse({ ...valid, type: "UNKNOWN" })).toThrow();
  });
});

describe("ApplyStagePromotionSchema", () => {
  it("accepts valid promotion", () => {
    expect(
      ApplyStagePromotionSchema.parse({
        newPrice: 590,
        endDate: "2026-05-31",
        reason: "Promo printemps",
      })
    ).toBeTruthy();
  });

  it("accepts promotion without optional fields", () => {
    expect(ApplyStagePromotionSchema.parse({ newPrice: 590 })).toBeTruthy();
  });

  it("rejects negative price", () => {
    expect(() => ApplyStagePromotionSchema.parse({ newPrice: -1 })).toThrow();
  });

  it("rejects invalid endDate", () => {
    expect(() =>
      ApplyStagePromotionSchema.parse({ newPrice: 590, endDate: "not-a-date" })
    ).toThrow();
  });
});

// ─── Orders ───────────────────────────────────────────────────────────────────
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../features/orders/schemas";

describe("CreateOrderSchema", () => {
  it("accepts minimum valid order", () => {
    expect(CreateOrderSchema.parse({ customerEmail: "client@email.fr" })).toBeTruthy();
  });

  it("rejects invalid email", () => {
    expect(() => CreateOrderSchema.parse({ customerEmail: "not-an-email" })).toThrow();
  });

  it("accepts with optional promoCodeId", () => {
    expect(
      CreateOrderSchema.parse({
        customerEmail: "client@email.fr",
        promoCodeId: "promo-id-123",
      })
    ).toBeTruthy();
  });

  it("accepts with full customerData", () => {
    expect(
      CreateOrderSchema.parse({
        customerEmail: "client@email.fr",
        customerData: {
          firstName: "Jean",
          lastName: "Dupont",
          phone: "0612345678",
          address: "12 rue de la Paix",
          postalCode: "75001",
          city: "Paris",
          country: "France",
        },
      })
    ).toBeTruthy();
  });
});

describe("UpdateOrderStatusSchema", () => {
  it("accepts valid status values", () => {
    const statuses = ["PENDING", "PAID", "CONFIRMED", "CANCELLED", "REFUNDED"];
    statuses.forEach((status) => {
      expect(UpdateOrderStatusSchema.parse({ status })).toBeTruthy();
    });
  });

  it("rejects unknown status", () => {
    expect(() => UpdateOrderStatusSchema.parse({ status: "UNKNOWN" })).toThrow();
  });
});

// ─── Promo Codes ──────────────────────────────────────────────────────────────
import { CreatePromoCodeSchema } from "../features/promocodes/schemas";

describe("CreatePromoCodeSchema", () => {
  it("accepts valid FIXED discount", () => {
    expect(
      CreatePromoCodeSchema.parse({
        code: "PROMO10",
        discountType: "FIXED",
        discountValue: 50,
      })
    ).toBeTruthy();
  });

  it("accepts valid PERCENTAGE discount", () => {
    expect(
      CreatePromoCodeSchema.parse({
        code: "SUMMER2026",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountAmount: 80,
        minCartAmount: 200,
        maxUses: 100,
      })
    ).toBeTruthy();
  });

  it("rejects empty code", () => {
    expect(() =>
      CreatePromoCodeSchema.parse({ code: "", discountType: "FIXED", discountValue: 50 })
    ).toThrow();
  });

  it("rejects invalid discountType", () => {
    expect(() =>
      CreatePromoCodeSchema.parse({
        code: "TEST",
        discountType: "UNKNOWN",
        discountValue: 10,
      })
    ).toThrow();
  });

  it("rejects negative discountValue", () => {
    expect(() =>
      CreatePromoCodeSchema.parse({
        code: "TEST",
        discountType: "FIXED",
        discountValue: -5,
      })
    ).toThrow();
  });
});

// ─── Admin Reservation (Stage) ────────────────────────────────────────────────
import { CreateByAdminReservationStageSchema } from "../features/reservations/stages/schemas";

describe("CreateByAdminReservationStageSchema", () => {
  const valid = {
    customerId: "stagiaire-uuid-1",
    stageId: "stage-uuid-1",
    type: "INITIATION",
  };

  it("accepts valid data", () => {
    expect(CreateByAdminReservationStageSchema.parse(valid)).toBeTruthy();
  });

  it("accepts PROGRESSION type", () => {
    expect(
      CreateByAdminReservationStageSchema.parse({ ...valid, type: "PROGRESSION" })
    ).toBeTruthy();
  });

  it("accepts AUTONOMIE type", () => {
    expect(
      CreateByAdminReservationStageSchema.parse({ ...valid, type: "AUTONOMIE" })
    ).toBeTruthy();
  });

  it("rejects empty customerId", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({ ...valid, customerId: "" })
    ).toThrow();
  });

  it("rejects empty stageId", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({ ...valid, stageId: "" })
    ).toThrow();
  });

  it("rejects invalid type", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({ ...valid, type: "BIPLACE" })
    ).toThrow();
  });

  it("rejects missing type", () => {
    expect(() =>
      CreateByAdminReservationStageSchema.parse({
        customerId: valid.customerId,
        stageId: valid.stageId,
      })
    ).toThrow();
  });
});
