import { Context } from "hono";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function handleUpdateOrderStatus(c: Context){
  try {
    const orderId = c.req.param("id");
    // zValidator in route.ts guarantees shape
    const { status } = c.req.valid("json" as never) as { status: OrderStatus };

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { orderItems: true, payments: true },
    });

    return c.json({
      success: true,
      message: `Commande ${order.orderNumber} mise à jour`,
      data: order,
    });
  } catch (error) {
    console.error("Erreur mise à jour commande:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la mise à jour de la commande",
      data: null,
    });
  }
}
