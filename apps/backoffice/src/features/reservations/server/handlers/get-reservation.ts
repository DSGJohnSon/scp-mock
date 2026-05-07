import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetReservation(c: Context) {
  try {
    const id = c.req.param("id");

    const stageBooking = await prisma.stageBooking.findUnique({
      where: { id },
      include: {
        stagiaire: true,
        stage: {
          include: {
            moniteurs: { include: { moniteur: true } },
            bookings: {
              where: {
                orderItem: {
                  is: {
                    order: {
                      status: { in: ["PAID", "PARTIALLY_PAID", "FULLY_PAID", "CONFIRMED"] },
                    },
                  },
                },
              },
            },
          },
        },
        orderItem: {
          include: {
            order: {
              include: {
                client: true,
                promoCode: true,
                payments: {
                  include: { recordedByUser: true },
                  orderBy: { createdAt: "asc" },
                },
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

    if (stageBooking) {
      const totalPlaces = stageBooking.stage.places;
      const confirmedBookings = stageBooking.stage.bookings.length;
      const remainingPlaces = totalPlaces - confirmedBookings;

      return c.json({
        success: true,
        data: {
          type: "STAGE",
          booking: stageBooking,
          availablePlaces: {
            total: totalPlaces,
            confirmed: confirmedBookings,
            remaining: remainingPlaces,
          },
        },
      });
    }

    return c.json({ success: false, message: "Réservation non trouvée", data: null }, 404);
  } catch (error) {
    console.error("Erreur récupération détails réservation:", error);
    return c.json(
      { success: false, message: "Erreur lors de la récupération des détails de la réservation", data: null },
      500,
    );
  }
}
