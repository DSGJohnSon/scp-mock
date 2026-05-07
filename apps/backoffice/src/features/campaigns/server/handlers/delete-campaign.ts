import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleDeleteCampaign(c: Context) {
  try {
    await prisma.smsCampaign.delete({ where: { id: c.req.param("id") as string } });
    return c.json({ success: true, message: "Supprimée" });
  } catch {
    return c.json({ success: false, message: "Erreur serveur" });
  }
}
