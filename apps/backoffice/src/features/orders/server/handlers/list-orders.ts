import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleListOrders(c: Context){
  try {
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { status: { not: "PENDING" } },
          {
            AND: [
              { status: "PENDING" },
              { updatedAt: { gte: sixHoursAgo } },
            ],
          },
        ],
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        orderItems: {
          select: { id: true, type: true, quantity: true, totalPrice: true },
        },
        payments: {
          select: { id: true, status: true, amount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: orders });
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la récupération des commandes",
      data: null,
    });
  }
}
