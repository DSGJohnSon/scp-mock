/**
 * availability.test.ts
 *
 * Unit tests for AvailabilityService in src/lib/availability.ts.
 *
 * - processPeriodsWithCounts: pure private method, tested via (as any) cast
 * - checkAvailabilityBatch: tested for the no-items short-circuit (no DB call)
 * - checkAvailability: tested with mocked Prisma for core business rules
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock is hoisted — use vi.hoisted() for variables referenced inside the factory
const { mockCartItemDeleteMany, mockCartItemCount, mockStageFindUnique, mockStageFindMany } =
  vi.hoisted(() => ({
    mockCartItemDeleteMany: vi.fn().mockResolvedValue({}),
    mockCartItemCount: vi.fn().mockResolvedValue(0),
    mockStageFindUnique: vi.fn(),
    mockStageFindMany: vi.fn().mockResolvedValue([]),
  }));

vi.mock("@/lib/prisma", () => ({
  default: {
    cartItem: { deleteMany: mockCartItemDeleteMany, count: mockCartItemCount },
    stage: { findUnique: mockStageFindUnique, findMany: mockStageFindMany },
  },
}));

import { AvailabilityService } from "@/lib/availability";

// Expose the private static method for direct testing
const processPeriodsWithCounts = (dates: Date[]) =>
  (AvailabilityService as any).processPeriodsWithCounts(dates);

// ---- processPeriodsWithCounts (pure logic) --------------------------------

describe("AvailabilityService.processPeriodsWithCounts", () => {
  it("returns empty years and monthsByYear for an empty array", () => {
    const result = processPeriodsWithCounts([]);
    expect(result.years).toEqual([]);
    expect(result.monthsByYear).toEqual({});
  });

  it("maps a single date to the correct year and 1-based month", () => {
    const result = processPeriodsWithCounts([new Date(2026, 5, 15)]); // June
    expect(result.years).toEqual([{ year: 2026, count: 1 }]);
    expect(result.monthsByYear[2026]).toEqual([{ month: 6, count: 1 }]);
  });

  it("accumulates count for multiple dates in the same year-month", () => {
    const result = processPeriodsWithCounts([
      new Date(2026, 5, 1),
      new Date(2026, 5, 20),
    ]);
    expect(result.years[0].count).toBe(2);
    expect(result.monthsByYear[2026][0].count).toBe(2);
  });

  it("sorts years ascending when dates span multiple years", () => {
    const result = processPeriodsWithCounts([
      new Date(2027, 0, 1),
      new Date(2026, 0, 1),
    ]);
    expect(result.years.map((y) => y.year)).toEqual([2026, 2027]);
  });

  it("sorts months within a year ascending", () => {
    const result = processPeriodsWithCounts([
      new Date(2026, 8, 1), // September
      new Date(2026, 2, 1), // March
    ]);
    expect(result.monthsByYear[2026].map((m) => m.month)).toEqual([3, 9]);
  });

  it("correctly separates stage counts across different years", () => {
    const result = processPeriodsWithCounts([
      new Date(2026, 0, 1),
      new Date(2027, 0, 1),
    ]);
    expect(result.years).toHaveLength(2);
    expect(result.monthsByYear[2026]).toHaveLength(1);
    expect(result.monthsByYear[2027]).toHaveLength(1);
  });
});

// ---- checkAvailabilityBatch -----------------------------------------------

describe("AvailabilityService.checkAvailabilityBatch", () => {
  it("returns an empty record without touching the DB when items array is empty", async () => {
    const result = await AvailabilityService.checkAvailabilityBatch([]);
    expect(result).toEqual({});
    expect(mockCartItemDeleteMany).not.toHaveBeenCalled();
  });
});

// ---- checkAvailability ----------------------------------------------------

describe("AvailabilityService.checkAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartItemDeleteMany.mockResolvedValue({});
    mockCartItemCount.mockResolvedValue(0);
  });

  it("returns available:false with 'Stage introuvable' when stage does not exist", async () => {
    mockStageFindUnique.mockResolvedValue(null);
    const result = await AvailabilityService.checkAvailability("stage", "unknown-id");
    expect(result.available).toBe(false);
    expect((result as any).reason).toBe("Stage introuvable");
  });

  it("returns available:true and correct counts when places are free", async () => {
    mockStageFindUnique.mockResolvedValue({ id: "s1", places: 10, bookings: [] });
    mockCartItemCount.mockResolvedValue(2);
    const result = await AvailabilityService.checkAvailability("stage", "s1");
    expect(result.available).toBe(true);
    expect((result as any).availablePlaces).toBe(8);
    expect((result as any).pendingCartItems).toBe(2);
  });

  it("returns available:false with 'Places insuffisantes' when stage is full", async () => {
    mockStageFindUnique.mockResolvedValue({
      id: "s2",
      places: 2,
      bookings: [{ id: "b1" }, { id: "b2" }],
    });
    mockCartItemCount.mockResolvedValue(0);
    const result = await AvailabilityService.checkAvailability("stage", "s2");
    expect(result.available).toBe(false);
    expect((result as any).reason).toBe("Places insuffisantes");
  });
});
