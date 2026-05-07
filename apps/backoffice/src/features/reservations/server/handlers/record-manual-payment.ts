import { Context } from "hono";
import prisma from "@/lib/prisma";
import type { AppEnv } from "@/lib/middlewares/types";

export async function handleRecordManualPayment(c: Context<AppEnv>) {
  try {
    // zValidator in route.ts guarantees shape
    const { orderItemId, amount, paymentMethod, note } =
      c.req.valid("json" as never) as {
        orderItemId: string; amount: number;
        paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "CHECK"; note?: string;
      };

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return c.json({ success: false, message: "Réservation non trouvée" }, 404);
    }

    const order = orderItem.order;

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount,
        currency: "eur",
        status: "SUCCEEDED",
        isManual: true,
        manualPaymentMethod: paymentMethod,
        manualPaymentNote: note,
        recordedBy: c.get("userId"),
      },
    });

    await prisma.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        orderItemId: orderItem.id,
        allocatedAmount: amount,
      },
    });

    const depositAmount = orderItem.depositAmount || 0;
    const remainingAmount = orderItem.remainingAmount || 0;
    const totalPrice = orderItem.totalPrice;

    let newDepositAmount = depositAmount;
    let newRemainingAmount = remainingAmount;
    let isFullyPaid = orderItem.isFullyPaid;

    if (depositAmount === 0) {
      newDepositAmount = amount;
      newRemainingAmount = totalPrice - amount;
    } else {
      newRemainingAmount = Math.max(0, remainingAmount - amount);
      if (newRemainingAmount === 0) {
        isFullyPaid = true;
      }
    }

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        depositAmount: newDepositAmount,
        remainingAmount: newRemainingAmount,
        isFullyPaid,
        ...(isFullyPaid && {
          finalPaymentDate: new Date(),
          finalPaymentNote: note || `Paiement manuel par ${paymentMethod}`,
        }),
      },
    });

    const allOrderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    });

    const allItemsFullyPaid = allOrderItems.every((item) => {
      if (item.type === "STAGE")
        return item.id === orderItemId ? isFullyPaid : item.isFullyPaid;
      return false;
    });

    const hasAnyPartialPayment = allOrderItems.some((item) => {
      if (item.type === "STAGE") {
        const itemIsFullyPaid = item.id === orderItemId ? isFullyPaid : item.isFullyPaid;
        return !itemIsFullyPaid && (item.depositAmount || 0) > 0;
      }
      return false;
    });

    let newOrderStatus = order.status;
    if (allItemsFullyPaid) {
      newOrderStatus = "FULLY_PAID";
    } else if (hasAnyPartialPayment) {
      newOrderStatus = "PARTIALLY_PAID";
    }

    if (newOrderStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newOrderStatus },
      });
    }

    return c.json({
      success: true,
      message: "Paiement enregistré avec succès",
      data: {
        payment,
        orderItem: { depositAmount: newDepositAmount, remainingAmount: newRemainingAmount, isFullyPaid },
      },
    });
  } catch (error) {
    console.error("Erreur enregistrement paiement manuel:", error);
    return c.json({ success: false, message: "Erreur lors de l'enregistrement du paiement" }, 500);
  }
}
