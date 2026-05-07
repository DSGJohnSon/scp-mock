import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetCampaign(c: Context) {
  try {
    const id = c.req.param("id") as string;
    const data = await prisma.smsCampaign.findUnique({
      where: { id },
      include: {
        audiences: true,
        promoCodes: true,
        logs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!data)
      return c.json({ success: false, message: "Introuvable", data: null });
    return c.json({ success: true, message: "", data: data });
  } catch {
    return c.json({ success: false, message: "Erreur serveur", data: null });
  }
}
