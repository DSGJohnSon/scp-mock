import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetReservation(c: Context) {
  try {
    const id = c.req.param("id");

    const booking = await prisma.stageBooking.findUnique({
      where: { id },
      include: {
        stagiaire: true,
        stage: {
          include: {
            moniteurs: { include: { moniteur: true } },
            bookings: {
              where: { status: "CONFIRMED" },
            },
          },
        },
        orderItem: {
          include: {
            order: {
              include: {
                client: true,
                promoCode: true,
              },
            },
            paymentAllocations: {
              include: { payment: { include: { recordedByUser: true } } },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!booking) {
      return c.json(
        { success: false, message: "Réservation non trouvée", data: null },
        404,
      );
    }

    const confirmedBookingsCount = booking.stage.bookings.length;
    const availablePlaces = {
      total: booking.stage.places,
      confirmed: confirmedBookingsCount,
      remaining: booking.stage.places - confirmedBookingsCount,
    };

    return c.json({
      success: true,
      data: {
        type: "STAGE" as const,
        booking,
        availablePlaces,
      },
    });
  } catch (error) {
    console.error("Erreur récupération réservation:", error);
    return c.json(
      {
        success: false,
        message: "Erreur lors de la récupération de la réservation",
        data: null,
      },
      500,
    );
  }
}
