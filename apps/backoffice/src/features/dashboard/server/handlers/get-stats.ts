import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetStats(c: Context) {
  try {
    const now = new Date();

    // Parse selectedMonth param (format: YYYY-MM)
    const selectedMonthParam = c.req.query("selectedMonth");
    let smYear: number, smMonth0: number; // smMonth0 = 0-indexed
    if (selectedMonthParam && /^\d{4}-\d{2}$/.test(selectedMonthParam)) {
      const parts = selectedMonthParam.split("-").map(Number);
      smYear = parts[0];
      smMonth0 = parts[1] - 1;
    } else {
      smYear = now.getFullYear();
      smMonth0 = now.getMonth();
    }
    const smStart = new Date(smYear, smMonth0, 1);
    const smEnd = new Date(smYear, smMonth0 + 1, 0, 23, 59, 59);

    // Current year bounds (saison)
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    // Current/prev month (kept for backward compat)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Chart: 13 months
    const thirteenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

    // Fetch user role
    const user = await prisma.user.findUnique({
      where: { id: c.get("userId") },
      select: { role: true },
    });

    // Revenue for backward compat (current month)
    const [onlineRevenueThisMonth, manualRevenueThisMonth, totalRevenueThisYear] =
      await Promise.all([
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: false,
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: true,
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            createdAt: { gte: currentYearStart },
          },
          _sum: { amount: true },
        }),
      ]);

    const onlineRevenue = onlineRevenueThisMonth._sum.amount || 0;
    const manualRevenue = manualRevenueThisMonth._sum.amount || 0;
    const totalRevenueMonth = onlineRevenue + manualRevenue;
    const totalRevenueYear = totalRevenueThisYear._sum.amount || 0;

    // Helper: compute CA stats for a date range
    const computePeriodStats = async (start: Date, end: Date) => {
      const [
        onlinePaid,
        manualPaid,
        stageItemsAgg,
        stageBookingsCount,
        stageStagiaires,
      ] = await Promise.all([
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

      const onlineAmt = onlinePaid._sum.amount || 0;
      const manualAmt = manualPaid._sum.amount || 0;
      const totalCollected = onlineAmt + manualAmt;

      const stageCA = (stageItemsAgg._sum.totalPrice || 0) - (stageItemsAgg._sum.discountAmount || 0);
      const stagePending = stageItemsAgg._sum.remainingAmount || 0;
      const stageDeposits = stageItemsAgg._sum.depositAmount || 0;

      const totalCA = stageCA;
      const totalPending = stagePending;
      const depositsPaid = stageDeposits;
      const balancesPaid = totalCollected - depositsPaid;

      const uniqueStagiaires = new Set(stageStagiaires.map((b) => b.stagiaireId)).size;

      return {
        totalCA,
        totalCollected,
        totalPending,
        onlineCollected: onlineAmt,
        manualCollected: manualAmt,
        depositsPaid,
        balancesPaid,
        byProduct: {
          stages: {
            totalCA: stageCA,
            collected: stageCA - stagePending,
            pending: stagePending,
          },
        },
        totalReservations: stageBookingsCount,
        uniqueStagiaires,
      };
    };

    // Admin-only extended stats
    let chart = null;
    let thisMonth = null;
    let prevMonth = null;
    let reservations = null;
    let annualStats = null;
    let selectedMonthStats = null;
    let selectedMonthActivities = null;

    if (user?.role === "ADMIN") {
      // ── Chart data ──────────────────────────────────────────────────────────
      const [stackedMonthlyRaw, totalMonthlyRaw, pendingMonthlyRaw] = await Promise.all([
        // Stacked by product type — grouped by ORDER creation month
        prisma.$queryRaw<
          Array<{
            month: Date;
            is_manual: boolean;
            item_type: string | null;
            total: number;
          }>
        >`
          SELECT
            DATE_TRUNC('month', o."createdAt") AS month,
            p."isManual" AS is_manual,
            oi."type" AS item_type,
            COALESCE(SUM(pa."allocatedAmount"), 0)::float AS total
          FROM "Payment" p
          JOIN "PaymentAllocation" pa ON pa."paymentId" = p.id
          JOIN "OrderItem" oi ON oi.id = pa."orderItemId"
          JOIN "Order" o ON o.id = oi."orderId"
          WHERE p.status = 'SUCCEEDED'
            AND o."createdAt" >= ${thirteenMonthsAgo}
          GROUP BY DATE_TRUNC('month', o."createdAt"), p."isManual", oi."type"
          ORDER BY month ASC
        `,
        // Totals online/manual — grouped by ORDER creation month
        prisma.$queryRaw<
          Array<{
            month: Date;
            is_manual: boolean;
            total: number;
          }>
        >`
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
        // Pending balance per month (from order creation date)
        prisma.$queryRaw<
          Array<{
            month: Date;
            pending_balance: number;
          }>
        >`
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

      const byMonth = [];
      for (let i = 12; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

        const matchMonth = (item: { month: Date }) => {
          const d = new Date(item.month);
          return (
            d.getFullYear() === monthDate.getFullYear() &&
            d.getMonth() === monthDate.getMonth()
          );
        };

        const onlineTotal = totalMonthlyRaw
          .filter((r) => matchMonth(r) && !r.is_manual)
          .reduce((s, r) => s + Number(r.total), 0);
        const manualTotal = totalMonthlyRaw
          .filter((r) => matchMonth(r) && r.is_manual)
          .reduce((s, r) => s + Number(r.total), 0);

        const stagesTotal = stackedMonthlyRaw
          .filter((r) => matchMonth(r) && r.item_type === "STAGE")
          .reduce((s, r) => s + Number(r.total), 0);

        const pendingBalance = pendingMonthlyRaw
          .filter((r) => matchMonth(r))
          .reduce((s, r) => s + Number(r.pending_balance), 0);

        const monthLabelStr = monthDate.toLocaleDateString("fr-FR", {
          month: "short",
          year: "2-digit",
        });

        byMonth.push({
          month: monthKey,
          monthLabel: monthLabelStr,
          total: onlineTotal + manualTotal,
          online: onlineTotal,
          manual: manualTotal,
          stages: stagesTotal,
          pendingBalance,
        });
      }

      chart = { byMonth };

      // ── Annual + Monthly stats ──────────────────────────────────────────────
      const [rawAnnual, rawSelectedMonth] = await Promise.all([
        computePeriodStats(currentYearStart, currentYearEnd),
        computePeriodStats(smStart, smEnd),
      ]);

      annualStats = { ...rawAnnual, year: now.getFullYear() };
      selectedMonthStats = {
        ...rawSelectedMonth,
        year: smYear,
        month: smMonth0 + 1,
      };

      // ── Monthly activities (fill rates) ────────────────────────────────────
      const [monthStages, seasonStages] = await Promise.all([
        prisma.stage.findMany({
          where: { startDate: { gte: smStart, lte: smEnd } },
          select: {
            id: true,
            type: true,
            startDate: true,
            places: true,
            _count: { select: { bookings: true } },
          },
          orderBy: { startDate: "asc" },
        }),
        prisma.stage.findMany({
          where: { startDate: { gte: currentYearStart, lte: currentYearEnd } },
          select: { places: true, _count: { select: { bookings: true } } },
        }),
      ]);

      const calcFillRate = (items: { places: number; _count: { bookings: number } }[]) => {
        const totalPlaces = items.reduce((s, it) => s + it.places, 0);
        const reservedPlaces = items.reduce((s, it) => s + it._count.bookings, 0);
        return {
          totalPlaces,
          reservedPlaces,
          rate: totalPlaces > 0 ? Math.round((reservedPlaces / totalPlaces) * 100) : 0,
        };
      };

      selectedMonthActivities = {
        year: smYear,
        month: smMonth0 + 1,
        stages: monthStages.map((st) => ({
          id: st.id,
          type: st.type,
          startDate: st.startDate,
          places: st.places,
          bookingsCount: st._count.bookings,
          fillRate: st.places > 0 ? Math.round((st._count.bookings / st.places) * 100) : 0,
        })),
        seasonFillRate: {
          stages: calcFillRate(seasonStages),
        },
      };

      // ── thisMonth KPIs (backward compat) ───────────────────────────────────
      const [
        thisMonthSoldAgg,
        thisMonthCollectedOnline,
        thisMonthCollectedManual,
        thisMonthPendingBalance,
      ] = await Promise.all([
        prisma.order.aggregate({
          where: {
            payments: {
              some: {
                status: "SUCCEEDED",
                createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
              },
            },
          },
          _sum: { totalAmount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: false,
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: true,
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.orderItem.aggregate({
          where: {
            isFullyPaid: false,
            remainingAmount: { gt: 0 },
            order: {
              createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
            },
          },
          _sum: { remainingAmount: true },
        }),
      ]);

      const thisMonthOnline = thisMonthCollectedOnline._sum.amount || 0;
      const thisMonthManual = thisMonthCollectedManual._sum.amount || 0;

      thisMonth = {
        totalSold: thisMonthSoldAgg._sum.totalAmount || 0,
        totalCollected: thisMonthOnline + thisMonthManual,
        onlineCollected: thisMonthOnline,
        manualCollected: thisMonthManual,
        pendingBalance: thisMonthPendingBalance._sum.remainingAmount || 0,
      };

      // prevMonth KPIs
      const [
        prevMonthSoldAgg,
        prevMonthCollectedOnline,
        prevMonthCollectedManual,
        prevMonthPendingBalance,
      ] = await Promise.all([
        prisma.order.aggregate({
          where: {
            payments: {
              some: {
                status: "SUCCEEDED",
                createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
              },
            },
          },
          _sum: { totalAmount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: false,
            createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: true,
            createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.orderItem.aggregate({
          where: {
            isFullyPaid: false,
            remainingAmount: { gt: 0 },
            order: {
              createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
            },
          },
          _sum: { remainingAmount: true },
        }),
      ]);

      const prevMonthOnline = prevMonthCollectedOnline._sum.amount || 0;
      const prevMonthManual = prevMonthCollectedManual._sum.amount || 0;

      prevMonth = {
        totalSold: prevMonthSoldAgg._sum.totalAmount || 0,
        totalCollected: prevMonthOnline + prevMonthManual,
        onlineCollected: prevMonthOnline,
        manualCollected: prevMonthManual,
        pendingBalance: prevMonthPendingBalance._sum.remainingAmount || 0,
      };

      // Reservations stats
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const [
        stageBookingsThisMonth,
        newStagiairesThisMonth,
        upcomingStagesForFill,
      ] = await Promise.all([
        prisma.stageBooking.count({
          where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
        }),
        prisma.stagiaire.count({
          where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
        }),
        prisma.stage.findMany({
          where: { startDate: { gte: now, lte: thirtyDaysFromNow } },
          select: {
            places: true,
            _count: { select: { bookings: true } },
          },
        }),
      ]);

      const upcomingTotalPlaces = upcomingStagesForFill.reduce((s, st) => s + st.places, 0);
      const upcomingReservedPlaces = upcomingStagesForFill.reduce(
        (s, st) => s + st._count.bookings,
        0
      );
      const fillRate =
        upcomingTotalPlaces > 0
          ? Math.round((upcomingReservedPlaces / upcomingTotalPlaces) * 100)
          : 0;

      reservations = {
        stageBookingsThisMonth,
        newStagiairesThisMonth,
        newReservationsThisMonth: stageBookingsThisMonth,
        upcomingTotalPlaces,
        upcomingReservedPlaces,
        fillRate,
      };
    }

    return c.json({
      success: true,
      data: {
        revenue:
          user?.role === "ADMIN"
            ? {
                onlineRevenueThisMonth: onlineRevenue,
                totalRevenueThisMonth: totalRevenueMonth,
                totalRevenueThisYear: totalRevenueYear,
              }
            : null,
        chart: user?.role === "ADMIN" ? chart : null,
        thisMonth: user?.role === "ADMIN" ? thisMonth : null,
        prevMonth: user?.role === "ADMIN" ? prevMonth : null,
        reservations: user?.role === "ADMIN" ? reservations : null,
        kpis: null,
        annualStats: user?.role === "ADMIN" ? annualStats : null,
        selectedMonthStats: user?.role === "ADMIN" ? selectedMonthStats : null,
        selectedMonthActivities: user?.role === "ADMIN" ? selectedMonthActivities : null,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching dashboard statistics",
        data: null,
      },
      500
    );
  }
}
