import { Context } from "hono";
import prisma from "@/lib/prisma";
import { resolveAudience } from "@/lib/audience-resolver";
import { normalizeMobileNumber } from "@/lib/phone-normalizer";
import { sendSms } from "@/lib/twilio";
import { nanoid } from "nanoid";

export async function handleSendCampaign(c: Context) {
  const id = c.req.param("id") as string;

  try {
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

    if (campaign.status === "COMPLETED" || campaign.status === "SENDING") {
      return c.json({
        success: false,
        message: "Cette campagne a déjà été envoyée ou est en cours d'envoi",
        data: null,
      });
    }

    // 1. Résoudre tous les contacts de toutes les audiences
    const allContactsMap = new Map();
    for (const audience of campaign.audiences) {
      const dynamicContacts = await resolveAudience(audience.rules);
      dynamicContacts.forEach((contact) =>
        allContactsMap.set(contact.phone, {
          phone: contact.phone,
          name: contact.name,
        }),
      );
      audience.contacts.forEach((contact) =>
        allContactsMap.set(contact.phone, {
          phone: contact.phone,
          name: contact.name,
        }),
      );
    }

    const finalContacts = Array.from(allContactsMap.values());

    if (finalContacts.length === 0) {
      return c.json({
        success: false,
        message: "Aucun contact cible trouvé pour cette campagne",
        data: null,
      });
    }

    // 2. Marquer comme en cours d'envoi
    await prisma.smsCampaign.update({
      where: { id },
      data: { status: "SENDING" },
    });

    // 3. Boucle d'envoi (On pourrait faire du batching/queueing, mais ici on traite en direct pour la simplicité)
    let sentCount = 0;
    let failedCount = 0;

    // On lance le traitement en "arrière-plan" pour ne pas faire de timeout sur la requête HTTP
    // Note: Dans une vraie appli scalable on utiliserait Redis/BullMQ
    (async () => {
      for (const contact of finalContacts) {
        try {
          // Normalisation du téléphone
          const normalization = normalizeMobileNumber(contact.phone);
          if (!normalization.isValid || !normalization.formattedNumber) {
            await prisma.smsCampaignLog.create({
              data: {
                campaignId: id,
                recipientPhone: contact.phone,
                recipientName: contact.name,
                status: "FAILED",
                errorMessage:
                  normalization.error || "Numéro de mobile invalide",
              },
            });
            failedCount++;
            continue;
          }

          let messageContent = campaign.content;
          let generatedPromoCodeId: string | undefined;

          // Remplacement des variables de base
          if (contact.name) {
            const [firstName, ...lastNameParts] = contact.name.split(" ");
            messageContent = messageContent.replace("{PRENOM}", firstName);
            messageContent = messageContent.replace(
              "{NOM}",
              lastNameParts.join(" ") || firstName,
            );
          } else {
            messageContent = messageContent.replace("{PRENOM}", "");
            messageContent = messageContent.replace("{NOM}", "");
          }

          // Gestion du code Promo Unique
          if (campaign.generatePromoCode) {
            const uniqueCode = `S${nanoid(6).toUpperCase()}`;
            const promo = await prisma.promoCode.create({
              data: {
                code: uniqueCode,
                label: `Campagne: ${campaign.name}`,
                recipientNote: `Généré pour ${contact.name || contact.phone}`,
                discountType: campaign.promoDiscountType || "FIXED",
                discountValue: campaign.promoDiscountValue || 0,
                maxDiscountAmount: campaign.promoMaxDiscountAmount,
                minCartAmount: campaign.promoMinCartAmount,
                maxUses: 1, // Unique par personne
                expiryDate: campaign.promoExpiryDate,
                campaignId: campaign.id,
              },
            });
            generatedPromoCodeId = promo.id;
            messageContent = messageContent.replace(
              "{PROMO_CODE}",
              uniqueCode,
            );
          }

          // Envoi Twilio
          const twilioResult = await sendSms({
            to: normalization.formattedNumber,
            body: messageContent,
          });

          // Logging
          await prisma.smsCampaignLog.create({
            data: {
              campaignId: id,
              recipientPhone: normalization.formattedNumber,
              recipientName: contact.name,
              messageSid: twilioResult.messageSid,
              status: twilioResult.success ? "SENT" : "FAILED",
              errorMessage: twilioResult.error,
              sentAt: twilioResult.success ? new Date() : null,
            },
          });

          if (twilioResult.success) sentCount++;
          else failedCount++;
        } catch (itemError: any) {
          console.error("Error processing campaign item:", itemError);
          failedCount++;
        }
      }

      // 4. Finalisation du statut
      await prisma.smsCampaign.update({
        where: { id },
        data: {
          status: "COMPLETED",
          sentAt: new Date(),
        },
      });
    })();

    return c.json({
      success: true,
      message: `L'envoi de ${finalContacts.length} SMS a débuté en arrière-plan.`,
      data: { contactCount: finalContacts.length },
    });
  } catch (error: any) {
    console.error(error);
    return c.json({
      success: false,
      message: "Erreur lors du lancement de l'envoi",
      data: null,
    });
  }
}
