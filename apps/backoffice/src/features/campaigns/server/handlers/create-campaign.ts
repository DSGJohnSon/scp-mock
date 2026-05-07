import { Context } from "hono";
import prisma from "@/lib/prisma";
import { CreateCampaignSchema } from "../../schemas";

export async function handleCreateCampaign(c: Context) {
  const body = c.req.valid("json" as never) as typeof CreateCampaignSchema._output;
  try {
    // Création de la campagne (sans générer de code promo pour le moment, c'est fait à l'envoi)
    const campaign = await prisma.smsCampaign.create({
      data: {
        name: body.name,
        audiences: {
          connect: body.audienceIds.map((id: string) => ({ id })),
        },
        content: body.content,
        scheduledAt: body.scheduledAt,
        status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
        // Paramètres de promo à conserver pour l'envoi "SENDING"
        generatePromoCode: body.generatePromoCode ?? false,
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
      message: "Campagne enregistrée",
      data: campaign,
    });
  } catch (error: any) {
    console.error(error);
    return c.json({
      success: false,
      message: "Erreur lors de la création",
      data: null,
    });
  }
}
