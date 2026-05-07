import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleListCampaigns(c: Context) {
  try {
    const data = await prisma.smsCampaign.findMany({
      include: {
        audiences: true,
        promoCodes: true,
        _count: { select: { logs: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return c.json({ success: true, message: "", data });
  } catch {
    return c.json({ success: false, message: "Erreur serveur", data: null });
  }
}
