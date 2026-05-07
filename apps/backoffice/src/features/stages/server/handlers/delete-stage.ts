import { Context } from "hono";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export async function handleDeleteStage(c: Context) {
  try {
    const id = c.req.param("id");

    const stageToDelete = await prisma.stage.findUnique({
      where: { id },
      include: { bookings: true },
    });
    if (!stageToDelete) {
      return c.json({
        success: false,
        message: "Aucun stage trouvé avec cet ID.",
        data: null,
      });
    }
    if (stageToDelete.bookings.length > 0) {
      return c.json({
        success: false,
        message:
          "Ce stage ne peut pas être supprimé car il contient des réservations.",
        data: null,
      });
    }

    const result = await prisma.stage.delete({
      where: { id },
    });

    revalidateTag("min-prices-stages");

    return c.json({
      success: true,
      message: `Stage ${result.type} du ${result.startDate.toLocaleDateString()} supprimé.`,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodErrors = error.errors.map((e) => e.message);
      return c.json({
        success: false,
        message:
          zodErrors.length > 0
            ? zodErrors[0]
            : "Erreur dans la validation des données",
        data: null,
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
      }
    }
    return c.json({
      success: false,
      message: "Une erreur inattendue s'est produite.",
      data: null,
    });
  }
}
