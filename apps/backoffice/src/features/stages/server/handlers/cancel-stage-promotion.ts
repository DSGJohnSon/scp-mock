import { Context } from "hono";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function handleCancelStagePromotion(c: Context) {
  try {
    const id = c.req.param("id");

    const stage = await prisma.stage.findUnique({ where: { id } });
    if (!stage) {
      return c.json({ success: false, message: "Stage introuvable", data: null });
    }
    if (!stage.promotionOriginalPrice) {
      return c.json({ success: false, message: "Ce stage n'est pas en promotion", data: null });
    }

    const result = await prisma.stage.update({
      where: { id },
      data: {
        price: stage.promotionOriginalPrice,
        promotionOriginalPrice: null,
        promotionEndDate: null,
        promotionReason: null,
      },
    });

    revalidateTag("min-prices-stages");

    return c.json({
      success: true,
      message: `Promotion annulée, prix restauré à ${stage.promotionOriginalPrice}€`,
      data: result,
    });
  } catch (error) {
    console.error("Erreur annulation promotion:", error);
    return c.json({ success: false, message: "Erreur lors de l'annulation de la promotion", data: null });
  }
}
