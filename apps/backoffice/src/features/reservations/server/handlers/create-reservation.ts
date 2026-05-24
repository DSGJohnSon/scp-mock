import { Context } from "hono";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function handleCreateReservation(c: Context) {
  try {
    const { stagiaireId, stageId, type } = c.req.valid("json" as never) as {
      stagiaireId: string;
      stageId: string;
      type: "INITIATION" | "PROGRESSION" | "AUTONOMIE";
    };

    const booking = await prisma.stageBooking.create({
      data: { stagiaireId, stageId, type },
    });

    return c.json({
      success: true,
      message: "Réservation créée avec succès.",
      data: booking,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return c.json(
          { success: false, message: "Cette réservation existe déjà.", data: null },
          409,
        );
      }
      if (error.code === "P2003") {
        return c.json(
          { success: false, message: "Stage ou stagiaire introuvable.", data: null },
          404,
        );
      }
    }
    console.error("Erreur création réservation:", error);
    return c.json(
      { success: false, message: "Erreur lors de la création de la réservation.", data: null },
      500,
    );
  }
}
