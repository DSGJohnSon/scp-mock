import prisma from "@/lib/prisma";

export interface PeriodStatsResult {
  totalCA: number;
  totalCollected: number;
  totalPending: number;
  onlineCollected: number;
  manualCollected: number;
  depositsPaid: number;
  balancesPaid: number;
  totalReservations: number;
  uniqueStagiaires: number;
}

export async function computePeriodStats(start: Date, end: Date): Promise<PeriodStatsResult> {
  const [onlinePaid, manualPaid, stageItemsAgg, stageBookingsCount, stageStagiaires] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED", isManual: false, createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED", isManual: true, createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          type: "STAGE",
          order: {
            createdAt: { gte: start, lte: end },
            payments: { some: { status: "SUCCEEDED" } },
          },
        },
        _sum: { totalPrice: true, depositAmount: true, remainingAmount: true, discountAmount: true },
      }),
      prisma.stageBooking.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.stageBooking.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { stagiaireId: true },
        distinct: ["stagiaireId"],
      }),
    ]);

  const onlineAmt = onlinePaid._sum.amount ?? 0;
  const manualAmt = manualPaid._sum.amount ?? 0;
  const totalCollected = onlineAmt + manualAmt;

  const stageCA = (stageItemsAgg._sum.totalPrice ?? 0) - (stageItemsAgg._sum.discountAmount ?? 0);
  const stagePending = stageItemsAgg._sum.remainingAmount ?? 0;
  const stageDeposits = stageItemsAgg._sum.depositAmount ?? 0;

  return {
    totalCA: stageCA,
    totalCollected,
    totalPending: stagePending,
    onlineCollected: onlineAmt,
    manualCollected: manualAmt,
    depositsPaid: stageDeposits,
    balancesPaid: totalCollected - stageDeposits,
    totalReservations: stageBookingsCount,
    uniqueStagiaires: new Set(stageStagiaires.map((b) => b.stagiaireId)).size,
  };
}
