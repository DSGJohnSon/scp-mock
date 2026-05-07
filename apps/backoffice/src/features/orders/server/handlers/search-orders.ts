import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleSearchOrders(c: Context){
  try {
    const query = c.req.query("q") || "";

    if (!query || query.length < 2) {
      return c.json({ success: true, data: [] });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: query, mode: "insensitive" } },
          {
            client: {
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
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
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return c.json({ success: true, data: orders });
  } catch (error) {
    console.error("Erreur recherche commandes:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la recherche des commandes",
      data: null,
    });
  }
}
