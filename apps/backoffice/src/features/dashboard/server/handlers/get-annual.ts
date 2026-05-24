import { Context } from "hono";
import prisma from "@/lib/prisma";
import { computePeriodStats } from "../helpers/compute-period-stats";

export async function handleGetAnnual(c: Context) {
  try {
    const now = new Date();
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const thirteenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

    const [annualStatsRaw, totalMonthlyRaw, pendingMonthlyRaw] = await Promise.all([
      computePeriodStats(currentYearStart, currentYearEnd),

      // Encaissé online/manual par mois (groupé sur la date de création de la commande)
      prisma.$queryRaw<Array<{ month: Date; is_manual: boolean; total: number }>>`
        SELECT
          DATE_TRUNC('month', o."createdAt") AS month,
          p."isManual" AS is_manual,
          COALESCE(SUM(pa."allocatedAmount"), 0)::float AS total
        FROM "Payment" p
        JOIN "PaymentAllocation" pa ON pa."paymentId" = p.id
        JOIN "OrderItem" oi ON oi.id = pa."orderItemId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE p.status = 'SUCCEEDED'
          AND o."createdAt" >= ${thirteenMonthsAgo}
        GROUP BY DATE_TRUNC('month', o."createdAt"), p."isManual"
        ORDER BY month ASC
      `,

      // Soldes en attente par mois
      prisma.$queryRaw<Array<{ month: Date; pending_balance: number }>>`
        SELECT
          DATE_TRUNC('month', o."createdAt") AS month,
          COALESCE(SUM(oi."remainingAmount"), 0)::float AS pending_balance
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE oi."isFullyPaid" = false
          AND oi."remainingAmount" > 0
          AND o."createdAt" >= ${thirteenMonthsAgo}
        GROUP BY DATE_TRUNC('month', o."createdAt")
        ORDER BY month ASC
      `,
    ]);

    // Construire byMonth (13 mois glissants)
    const byMonth = [];
    for (let i = 12; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const matchMonth = (item: { month: Date }) => {
        const d = new Date(item.month);
        return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
      };

      const online = totalMonthlyRaw
        .filter((r) => matchMonth(r) && !r.is_manual)
        .reduce((s, r) => s + Number(r.total), 0);
      const manual = totalMonthlyRaw
        .filter((r) => matchMonth(r) && r.is_manual)
        .reduce((s, r) => s + Number(r.total), 0);
      const pendingBalance = pendingMonthlyRaw
        .filter((r) => matchMonth(r))
        .reduce((s, r) => s + Number(r.pending_balance), 0);

      byMonth.push({
        month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`,
        monthLabel: monthDate.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        total: online + manual,
        online,
        manual,
        pendingBalance,
      });
    }

    return c.json({
      success: true,
      data: {
        annualStats: { ...annualStatsRaw, year: now.getFullYear() },
        chart: { byMonth },
      },
    });
  } catch (error) {
    console.error("Error fetching annual dashboard stats:", error);
    return c.json({ success: false, message: "Erreur lors de la récupération des statistiques annuelles", data: null }, 500);
  }
}
