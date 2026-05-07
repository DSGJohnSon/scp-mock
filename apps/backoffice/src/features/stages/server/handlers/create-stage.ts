import { Context } from "hono";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { CreateStageSchema } from "../../schemas";

export async function handleCreateStage(c: Context) {
  try {
    // zValidator in route.ts guarantees shape
    const {
      startDate,
      duration,
      places,
      moniteurIds,
      price,
      acomptePrice,
      type,
    } = c.req.valid("json" as never) as z.infer<typeof CreateStageSchema>;
    const startDateObj = new Date(startDate);

    const result = await prisma.stage.create({
      data: {
        startDate: startDateObj,
        duration,
        places,
        price,
        acomptePrice,
        type,
        moniteurs: {
          create: moniteurIds.map((moniteurId: string) => ({
            moniteurId,
          })),
        },
      },
    });

    revalidateTag("min-prices-stages");

    return c.json({
      success: true,
      message: `Stage ${type} du ${result.startDate.toLocaleDateString()} créé.`,
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
        case "P2002":
          return c.json({
            success: false,
            message: "Un stage avec ces valeurs existe déjà.",
            data: null,
          });
        case "P2003":
          return c.json({
            success: false,
            message: "Moniteur introuvable.",
            data: null,
          });
        default:
          return c.json({
            success: false,
            message: `Erreur Prisma: ${error.message}`,
            data: null,
          });
      }
    }
    return c.json({
      success: false,
      message: "Une erreur inattendue s'est produite.",
      data: null,
    });
  }
}
