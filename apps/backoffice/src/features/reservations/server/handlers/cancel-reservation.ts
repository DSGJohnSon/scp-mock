import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleCancelReservation(c: Context) {
  try {
    const id = c.req.param("id");

    const booking = await prisma.stageBooking.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            order: {
              include: {
                orderItems: {
                  include: { stageBooking: true },
                },
              },
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

    if (booking.status === "CANCELLED") {
      return c.json(
        { success: false, message: "Cette réservation est déjà annulée", data: null },
        400,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.stageBooking.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      if (!booking.orderItem) return;

      // Vérifier si toutes les réservations liées à cette commande sont annulées
      const siblingBookings = booking.orderItem.order.orderItems
        .map((item) => item.stageBooking)
        .filter(Boolean);

      const allCancelled = siblingBookings.every(
        (b) => b!.id === id || b!.status === "CANCELLED",
      );

      if (allCancelled) {
        await tx.order.update({
          where: { id: booking.orderItem.order.id },
          data: { status: "CANCELLED" },
        });
      }
    });

    return c.json({
      success: true,
      message: "Réservation annulée avec succès",
      data: null,
    });
  } catch (error) {
    console.error("Erreur annulation réservation:", error);
    return c.json(
      {
        success: false,
        message: "Erreur lors de l'annulation de la réservation",
        data: null,
      },
      500,
    );
  }
}
