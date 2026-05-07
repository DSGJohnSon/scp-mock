import { Context } from "hono";
import prisma from "@/lib/prisma";
import type { AppEnv } from "@/lib/middlewares/types";
import { ApplyStagePromotionSchema } from "../../schemas";
import { revalidateTag } from "next/cache";

export async function handleApplyStagePromotion(c: Context<AppEnv>) {
  try {
    const id = c.req.param("id") as string;
    // zValidator in route.ts guarantees shape
    const { newPrice, endDate, reason } = c.req.valid("json" as never) as typeof ApplyStagePromotionSchema._output;
    const userId = c.get("userId");

    const stage = await prisma.stage.findUnique({ where: { id } });
    if (!stage) {
      return c.json({ success: false, message: "Stage introuvable", data: null });
    }

    const originalPrice = stage.promotionOriginalPrice ?? stage.price;
    const discountPercent = Math.round(((originalPrice - newPrice) / originalPrice) * 10000) / 100;

    const [result] = await Promise.all([
      prisma.stage.update({
        where: { id },
        data: {
          price: newPrice,
          promotionOriginalPrice: originalPrice,
          promotionEndDate: endDate ? new Date(endDate) : null,
          promotionReason: reason ?? null,
        },
      }),
      prisma.stagePromotionHistory.create({
        data: {
          stageId: id,
          originalPrice,
          promotedPrice: newPrice,
          discountPercent,
          reason: reason ?? null,
          endDate: endDate ? new Date(endDate) : null,
          appliedBy: userId ?? null,
        },
      }),
    ]);

    revalidateTag("min-prices-stages");

    return c.json({
      success: true,
      message: `Promotion de -${discountPercent}% appliquée au stage (${newPrice}€ au lieu de ${originalPrice}€)`,
      data: result,
    });
  } catch (error) {
    console.error("Erreur application promotion:", error);
    return c.json({ success: false, message: "Erreur lors de l'application de la promotion", data: null });
  }
}
