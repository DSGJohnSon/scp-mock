import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleListReservations(c: Context) {
  try {
    const { page, limit, search, bookingStatus, startDate, endDate } =
      c.req.valid("query" as never) as {
        page: string;
        limit: string;
        bookingStatus: string;
        search?: string;
        startDate?: string;
        endDate?: string;
      };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (bookingStatus && bookingStatus !== "ALL") {
      where.status = bookingStatus;
    }

    if (startDate || endDate) {
      where.stage = {
        startDate: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      };
    }

    if (search) {
      where.OR = [
        { stagiaire: { firstName: { contains: search, mode: "insensitive" } } },
        { stagiaire: { lastName: { contains: search, mode: "insensitive" } } },
        { stagiaire: { email: { contains: search, mode: "insensitive" } } },
        {
          orderItem: {
            is: {
              order: {
                orderNumber: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.stageBooking.findMany({
        where,
        include: {
          stagiaire: true,
          stage: { include: { moniteurs: { include: { moniteur: true } } } },
          orderItem: { include: { order: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.stageBooking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return c.json({
      success: true,
      data: {
        reservations: bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération réservations:", error);
    return c.json(
      {
        success: false,
        message: "Erreur lors de la récupération des réservations",
        data: null,
      },
      500,
    );
  }
}
