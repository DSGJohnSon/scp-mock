import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleListReservations(c: Context) {
  try {
    // zValidator in route.ts guarantees shape
    const { page, limit, search, type, status, startDate, endDate, category } =
      c.req.valid("query" as never) as {
        page: string; limit: string; type: string;
        search?: string; status?: string; startDate?: string; endDate?: string; category?: string;
      };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };

    const statusFilter = status
      ? { in: status.split(",") }
      : { in: ["PAID", "CONFIRMED", "PARTIALLY_PAID", "FULLY_PAID"] };

    let stageBookings: any[] = [];
    let stageCount = 0;

    if (type === "ALL" || type === "STAGE") {
      const stageWhere: any = {
        orderItem: { is: { order: { status: statusFilter } } },
      };

      if (Object.keys(dateFilter).length > 0) {
        stageWhere.stage = { startDate: dateFilter };
      }

      if (search) {
        stageWhere.OR = [
          { stagiaire: { firstName: { contains: search, mode: "insensitive" } } },
          { stagiaire: { lastName: { contains: search, mode: "insensitive" } } },
          { stagiaire: { email: { contains: search, mode: "insensitive" } } },
          { orderItem: { is: { order: { orderNumber: { contains: search, mode: "insensitive" } } } } },
        ];
      }

      if (category) {
        stageWhere.type = category;
      }

      [stageBookings, stageCount] = await Promise.all([
        prisma.stageBooking.findMany({
          where: stageWhere,
          include: {
            stagiaire: true,
            stage: { include: { moniteurs: { include: { moniteur: true } } } },
            orderItem: { include: { order: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: type === "STAGE" ? skip : 0,
          take: type === "STAGE" ? limitNum : undefined,
        }),
        prisma.stageBooking.count({ where: stageWhere }),
      ]);
    }

    const combinedResults = stageBookings.map((b) => ({
      ...b,
      bookingType: "STAGE" as const,
      date: b.stage.startDate,
    }));
    const totalCount = stageCount;
    const totalPages = Math.ceil(totalCount / limitNum);

    return c.json({
      success: true,
      data: {
        reservations: combinedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasMore: pageNum < totalPages,
        },
        stats: { totalStages: stageCount, total: stageCount },
      },
    });
  } catch (error) {
    console.error("Erreur récupération réservations:", error);
    return c.json(
      { success: false, message: "Erreur lors de la récupération des réservations", data: null },
      500,
    );
  }
}
