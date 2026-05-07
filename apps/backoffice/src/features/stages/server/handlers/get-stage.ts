import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetStage(c: Context) {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json({
        success: false,
        message: "ID is required",
        data: null,
      });
    }
    const result = await prisma.stage.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            stagiaire: true,
          },
        },
        moniteurs: {
          include: {
            moniteur: true,
          },
        },
      },
    });
    return c.json({ success: true, message: "", data: result });
  } catch (error) {
    return c.json({
      success: false,
      message: "Error fetching stage",
      data: null,
    });
  }
}
