import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetOrderPublic(c: Context){
  try {
    const orderId = c.req.param("id");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            stage: true,
            stageBooking: { include: { stagiaire: true } },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return c.json({ success: false, message: "Commande introuvable", data: null });
    }

    return c.json({ success: true, data: order });
  } catch (error) {
    console.error("Erreur récupération commande:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la récupération de la commande",
      data: null,
    });
  }
}
