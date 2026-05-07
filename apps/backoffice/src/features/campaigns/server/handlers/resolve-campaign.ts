import { Context } from "hono";
import prisma from "@/lib/prisma";
import { resolveAudience } from "@/lib/audience-resolver";

export async function handleResolveCampaign(c: Context) {
  try {
    const id = c.req.param("id") as string;
    const campaign = await prisma.smsCampaign.findUnique({
      where: { id },
      include: {
        audiences: {
          include: { rules: true, contacts: true },
        },
      },
    });

    if (!campaign) {
      return c.json({
        success: false,
        message: "Campagne introuvable",
        data: null,
      });
    }

    const allContactsMap = new Map();

    for (const audience of campaign.audiences) {
      // 1. Résoudre les règles dynamiques
      const dynamicContacts = await resolveAudience(audience.rules);
      dynamicContacts.forEach((contact) =>
        allContactsMap.set(contact.phone, contact),
      );

      // 2. Ajouter les contacts manuels
      audience.contacts.forEach((contact) =>
        allContactsMap.set(contact.phone, {
          phone: contact.phone,
          name: contact.name,
        }),
      );
    }

    const finalContacts = Array.from(allContactsMap.values());

    return c.json({
      success: true,
      message: "",
      data: {
        contacts: finalContacts,
        count: finalContacts.length,
      },
    });
  } catch (error) {
    console.error("Campaign resolve error:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la résolution des contacts",
      data: null,
    });
  }
}
