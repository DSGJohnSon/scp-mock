import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleFinalizeOrderItem(c: Context){
  const orderItemId = c.req.param("orderItemId");
  // zValidator in route.ts guarantees shape
  const { note } = c.req.valid("json" as never) as { note?: string };

  if (!orderItemId) {
    return c.json({ success: false, message: "ID de l'article requis", data: null });
  }

  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: { include: { orderItems: true } } },
    });

    if (!orderItem) {
      return c.json({ success: false, message: "Article de commande introuvable", data: null });
    }

    if (orderItem.type !== "STAGE") {
      return c.json({ success: false, message: "Seuls les stages nécessitent un paiement final", data: null });
    }

    if (orderItem.isFullyPaid) {
      return c.json({ success: false, message: "Cet article est déjà entièrement payé", data: null });
    }

    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        isFullyPaid: true,
        finalPaymentDate: new Date(),
        finalPaymentNote: note,
        remainingAmount: 0,
      },
    });

    const allItemsFullyPaid = orderItem.order.orderItems.every(
      (item) => item.id === orderItemId || item.isFullyPaid,
    );

    if (allItemsFullyPaid) {
      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: { status: "FULLY_PAID" },
      });
    }

    return c.json({
      success: true,
      message: `Paiement final confirmé. ${allItemsFullyPaid ? "Commande entièrement payée." : "Il reste des articles à payer."}`,
      data: { orderItem: updatedOrderItem, orderFullyPaid: allItemsFullyPaid },
    });
  } catch (error) {
    console.error("Erreur confirmation paiement final:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la confirmation du paiement final",
      data: null,
    });
  }
}
