import { Context } from "hono";
import prisma from "@/lib/prisma";
import { UpdateCampaignSchema } from "../../schemas";

export async function handleUpdateCampaign(c: Context) {
  const id = c.req.param("id") as string;
  const body = c.req.valid("json" as never) as typeof UpdateCampaignSchema._output;

  try {
    const existing = await prisma.smsCampaign.findUnique({
      where: { id },
    });

    if (!existing) {
      return c.json({
        success: false,
        message: "Campagne introuvable",
        data: null,
      });
    }

    if (existing.status !== "DRAFT" && existing.status !== "SCHEDULED") {
      return c.json({
        success: false,
        message:
          "Seules les campagnes en brouillon ou planifiées peuvent être modifiées",
        data: null,
      });
    }

    const campaign = await prisma.smsCampaign.update({
      where: { id },
      data: {
        name: body.name,
        content: body.content,
        scheduledAt: body.scheduledAt,
        status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
        // Audiences
        ...(body.audienceIds && {
          audiences: {
            set: body.audienceIds.map((id: string) => ({ id })),
          },
        }),
        // Promo fields
        generatePromoCode: body.generatePromoCode,
        promoDiscountType: body.promoDiscountType,
        promoDiscountValue: body.promoDiscountValue,
        promoMaxDiscountAmount: body.promoMaxDiscountAmount,
        promoMinCartAmount: body.promoMinCartAmount,
        promoMaxUses: body.promoMaxUses,
        promoExpiryDate: body.promoExpiryDate,
      },
    });

    return c.json({
      success: true,
      message: "Campagne mise à jour",
      data: campaign,
    });
  } catch (error: any) {
    console.error(error);
    return c.json({
      success: false,
      message: "Erreur lors de la mise à jour",
      data: null,
    });
  }
}
