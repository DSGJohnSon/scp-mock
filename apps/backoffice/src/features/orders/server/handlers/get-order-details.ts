import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetOrderDetails(c: Context){
  try {
    const orderId = c.req.param("id");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        promoCode: true,
        orderItems: {
          include: {
            stage: true,
            stageBooking: { include: { stagiaire: true } },
            paymentAllocations: {
              include: {
                payment: { include: { recordedByUser: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
        payments: {
          include: { recordedByUser: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return c.json({ success: false, message: "Commande introuvable", data: null }, 404);
    }

    return c.json({ success: true, data: order });
  } catch (error) {
    console.error("Erreur récupération détails commande:", error);
    return c.json({ success: false, message: "Erreur lors de la récupération", data: null }, 500);
  }
}
