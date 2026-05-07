import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleDeleteGhostOrders(c: Context){
  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const ghostOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: cutoff },
        payments: { none: { status: "SUCCEEDED" } },
      },
      select: { id: true, orderNumber: true },
    });

    if (ghostOrders.length === 0) {
      return c.json({ success: true, message: "Aucune commande fantôme à supprimer", data: { deleted: 0 } });
    }

    const ids = ghostOrders.map((o) => o.id);
    await prisma.order.deleteMany({ where: { id: { in: ids } } });

    console.log(`[GHOST-CLEANUP] Deleted ${ids.length} ghost orders: ${ids.join(", ")}`);

    return c.json({
      success: true,
      message: `${ids.length} commande(s) fantôme(s) supprimée(s)`,
      data: { deleted: ids.length, orderNumbers: ghostOrders.map((o) => o.orderNumber) },
    });
  } catch (error) {
    console.error("Erreur nettoyage commandes fantômes:", error);
    return c.json({ success: false, message: "Erreur lors du nettoyage", data: null }, 500);
  }
}
