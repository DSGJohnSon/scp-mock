import { Context } from "hono";
import { computePeriodStats } from "../helpers/compute-period-stats";

export async function handleGetMonthly(c: Context) {
  try {
    const now = new Date();
    const monthParam = c.req.query("month");

    let smYear: number;
    let smMonth0: number; // 0-indexed

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      smYear = y;
      smMonth0 = m - 1;
    } else {
      smYear = now.getFullYear();
      smMonth0 = now.getMonth();
    }

    const smStart = new Date(smYear, smMonth0, 1);
    const smEnd = new Date(smYear, smMonth0 + 1, 0, 23, 59, 59);

    const stats = await computePeriodStats(smStart, smEnd);

    return c.json({
      success: true,
      data: {
        selectedMonthStats: { ...stats, year: smYear, month: smMonth0 + 1 },
      },
    });
  } catch (error) {
    console.error("Error fetching monthly dashboard stats:", error);
    return c.json({ success: false, message: "Erreur lors de la récupération des statistiques mensuelles", data: null }, 500);
  }
}
