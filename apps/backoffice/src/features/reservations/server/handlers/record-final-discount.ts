import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleRecordFinalDiscount(c: Context) {
  try {
    // zValidator in route.ts guarantees shape
    const { orderItemId, amount, note } = c.req.valid("json" as never) as {
      orderItemId: string; amount: number; note?: string;
    };

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        paymentAllocations: { include: { payment: true } },
      },
    });

    if (!orderItem) {
      return c.json({ success: false, message: "Réservation non trouvée" }, 404);
    }

    const totalPaid = orderItem.paymentAllocations.reduce(
      (sum: number, a) => {
        if (a.payment?.status === "SUCCEEDED") return sum + a.allocatedAmount;
        return sum;
      },
      0,
    );

    const existingDiscount = orderItem.finalDiscountAmount || 0;
    const dynamicRemaining = Math.max(0, orderItem.totalPrice - totalPaid - existingDiscount);

    if (amount > dynamicRemaining) {
      return c.json(
        {
          success: false,
          message: `La réduction (${amount}€) dépasse le solde restant (${dynamicRemaining.toFixed(2)}€)`,
        },
        400,
      );
    }

    const newDiscount = existingDiscount + amount;
    const newRemaining = Math.max(0, dynamicRemaining - amount);
    const isFullyPaid = newRemaining === 0;

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        finalDiscountAmount: newDiscount,
        finalDiscountNote: note,
        finalDiscountDate: new Date(),
        ...(isFullyPaid && !orderItem.isFullyPaid && {
          isFullyPaid: true,
          finalPaymentDate: new Date(),
          finalPaymentNote: note || "Solde couvert par réduction finale",
        }),
      },
    });

    if (isFullyPaid && !orderItem.isFullyPaid) {
      const allOrderItems = await prisma.orderItem.findMany({
        where: { orderId: orderItem.order.id },
      });

      const allItemsFullyPaid = allOrderItems.every((item) => {
        if (item.type === "STAGE")
          return item.id === orderItemId ? isFullyPaid : item.isFullyPaid;
        return false;
      });

      if (allItemsFullyPaid) {
        await prisma.order.update({
          where: { id: orderItem.order.id },
          data: { status: "FULLY_PAID" },
        });
      }
    }

    return c.json({
      success: true,
      message: "Réduction enregistrée avec succès",
      data: { finalDiscountAmount: newDiscount, remainingAmount: newRemaining, isFullyPaid },
    });
  } catch (error) {
    console.error("Erreur enregistrement réduction finale:", error);
    return c.json(
      { success: false, message: "Erreur lors de l'enregistrement de la réduction" },
      500,
    );
  }
}
