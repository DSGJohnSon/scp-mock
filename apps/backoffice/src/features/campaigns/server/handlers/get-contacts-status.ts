import { Context } from "hono";
import prisma from "@/lib/prisma";
import { resolveAudience } from "@/lib/audience-resolver";

export async function handleGetContactsStatus(c: Context) {
  try {
    const id = c.req.param("id") as string;
    const campaign = await prisma.smsCampaign.findUnique({
      where: { id },
      include: {
        audiences: { include: { rules: true, contacts: true } },
      },
    });

    if (!campaign) {
      return c.json({ success: false, message: "Campagne introuvable", data: null });
    }

    // 1. Résoudre tous les contacts
    const allContactsMap = new Map<string, { phone: string; name?: string }>();
    for (const audience of campaign.audiences) {
      const dynamicContacts = await resolveAudience(audience.rules);
      dynamicContacts.forEach((contact) => allContactsMap.set(contact.phone, contact));
      audience.contacts.forEach((contact) =>
        allContactsMap.set(contact.phone, { phone: contact.phone, name: contact.name ?? undefined }),
      );
    }

    // 2. Récupérer les logs SENT/FAILED et normaliser les numéros
    const logs = await prisma.smsCampaignLog.findMany({
      where: { campaignId: id },
      select: { recipientPhone: true, status: true, sentAt: true, errorMessage: true },
    });

    // Index par numéro normalisé (digits only) pour une comparaison robuste
    const normalize = (p: string) => p.replace(/\D/g, "").slice(-9); // 9 derniers chiffres
    const logIndex = new Map<string, { status: string; sentAt: Date | null; error: string | null }>();
    for (const log of logs) {
      const key = normalize(log.recipientPhone);
      // Conserver le log SENT s'il en existe un (priorité)
      if (!logIndex.has(key) || log.status === "SENT" || log.status === "DELIVERED") {
        logIndex.set(key, { status: log.status, sentAt: log.sentAt, error: log.errorMessage });
      }
    }

    // 3. Merger contacts + statuts
    const contacts = Array.from(allContactsMap.values()).map((contact) => {
      const key = normalize(contact.phone);
      const log = logIndex.get(key);
      const sent = log?.status === "SENT" || log?.status === "DELIVERED";
      const failed = log?.status === "FAILED" && !sent;
      return {
        phone: contact.phone,
        name: contact.name ?? null,
        sent,
        failed,
        sentAt: log?.sentAt ?? null,
        error: failed ? (log?.error ?? null) : null,
      };
    });

    return c.json({
      success: true,
      message: "",
      data: {
        contacts,
        sentCount: contacts.filter((c) => c.sent).length,
        total: contacts.length,
      },
    });
  } catch (error) {
    console.error("Contacts-status error:", error);
    return c.json({ success: false, message: "Erreur serveur", data: null });
  }
}
