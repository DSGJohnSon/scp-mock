import "server-only";
import prisma from "../../lib/prisma";

export class AvailabilityService {

  static async checkAvailability(
    type: 'stage',
    itemId: string,
    requestedQuantity: number = 1
  ) {
    const now = new Date();

    // Clean expired cart items for this stage before checking availability
    await prisma.cartItem.deleteMany({
      where: {
        type: 'STAGE',
        stageId: itemId,
        expiresAt: { lte: now },
        isExpired: false,
      },
    });

    const stage = await prisma.stage.findUnique({
      where: { id: itemId },
      include: { bookings: true },
    });

    if (!stage) return { available: false, reason: 'Stage introuvable' };

    const confirmedBookings = stage.bookings.length;

    const temporaryCartItems = await prisma.cartItem.count({
      where: {
        type: 'STAGE',
        stageId: itemId,
        expiresAt: { gt: now },
        isExpired: false,
      },
    });

    const totalReserved = confirmedBookings + temporaryCartItems;
    const availablePlaces = stage.places - totalReserved;

    return {
      available: availablePlaces >= requestedQuantity,
      availablePlaces,
      totalPlaces: stage.places,
      confirmedBookings,
      pendingCartItems: temporaryCartItems,
      reason: availablePlaces < requestedQuantity ? 'Places insuffisantes' : null,
    };
  }

  /**
   * Check availability for multiple stages in a single pass (2 DB queries)
   */
  static async checkAvailabilityBatch(
    items: { type: 'stage'; itemId: string }[]
  ): Promise<Record<string, { available: boolean; availablePlaces: number; totalPlaces: number; confirmedBookings: number; pendingCartItems: number; reason: string | null }>> {
    if (items.length === 0) return {};

    const now = new Date();
    const stageIds = items.map(i => i.itemId);

    await prisma.cartItem.deleteMany({
      where: {
        type: 'STAGE',
        stageId: { in: stageIds },
        expiresAt: { lte: now },
        isExpired: false,
      },
    });

    const [stages, stageTempCounts] = await Promise.all([
      prisma.stage.findMany({
        where: { id: { in: stageIds } },
        select: { id: true, places: true, _count: { select: { bookings: true } } },
      }),
      prisma.cartItem.groupBy({
        by: ['stageId'],
        where: { type: 'STAGE', stageId: { in: stageIds }, expiresAt: { gt: now }, isExpired: false },
        _count: { id: true },
      }),
    ]);

    const result: Record<string, { available: boolean; availablePlaces: number; totalPlaces: number; confirmedBookings: number; pendingCartItems: number; reason: string | null }> = {};

    const stageTempMap = new Map(
      stageTempCounts.filter(s => s.stageId !== null).map(s => [s.stageId!, s._count.id])
    );

    for (const stage of stages as { id: string; places: number; _count: { bookings: number } }[]) {
      const confirmedBookings = stage._count.bookings;
      const pendingCartItems = stageTempMap.get(stage.id) || 0;
      const availablePlaces = stage.places - confirmedBookings - pendingCartItems;
      result[stage.id] = {
        available: availablePlaces >= 1,
        availablePlaces: Math.max(0, availablePlaces),
        totalPlaces: stage.places,
        confirmedBookings,
        pendingCartItems,
        reason: availablePlaces < 1 ? 'Places insuffisantes' : null,
      };
    }

    return result;
  }

  static async getAvailablePeriodsWithCounts(
    stageType?: 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE'
  ): Promise<{
    years: { year: number; count: number }[];
    monthsByYear: Record<number, { month: number; count: number }[]>;
  }> {
    const now = new Date();
    const maxYear = now.getFullYear() + 2;

    const whereClause: any = {
      startDate: { gte: now, lte: new Date(maxYear, 11, 31, 23, 59, 59) },
    };

    if (stageType) {
      if (stageType === 'INITIATION' || stageType === 'PROGRESSION') {
        whereClause.type = { in: [stageType, 'DOUBLE'] };
      } else {
        whereClause.type = stageType;
      }
    }

    const stages = await prisma.stage.findMany({
      where: whereClause,
      select: { startDate: true },
    });

    return this.processPeriodsWithCounts(stages.map(s => s.startDate));
  }

  private static processPeriodsWithCounts(dates: Date[]): {
    years: { year: number; count: number }[];
    monthsByYear: Record<number, { month: number; count: number }[]>;
  } {
    const yearCounts = new Map<number, number>();
    const monthCounts = new Map<string, number>();

    dates.forEach(date => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
      monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
    });

    const years = Array.from(yearCounts.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);

    const monthsByYear: Record<number, { month: number; count: number }[]> = {};

    monthCounts.forEach((count, key) => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      if (!monthsByYear[year]) monthsByYear[year] = [];
      monthsByYear[year].push({ month, count });
    });

    Object.keys(monthsByYear).forEach(yearKey => {
      monthsByYear[parseInt(yearKey)].sort((a, b) => a.month - b.month);
    });

    return { years, monthsByYear };
  }

  static async getAvailableMonths(
    year: number,
    stageType?: 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE'
  ): Promise<number[]> {
    const periods = await this.getAvailablePeriodsWithCounts(stageType);
    return periods.monthsByYear[year]?.map(m => m.month) || [];
  }
}
