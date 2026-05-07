import { Context } from "hono";
import prisma from "@/lib/prisma";
import { Prisma, StageType } from "@prisma/client";

export async function handleListStages(c: Context) {
  const moniteurId = c.req.query("moniteurId");
  const date = c.req.query("date");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const types = c.req.query("types");

  const where: Prisma.StageWhereInput = {};
  if (moniteurId) where.moniteurs = { some: { moniteurId } };

  // Single-date filter (legacy) vs date-range filter
  if (date) {
    where.startDate = new Date(date);
  } else if (from || to) {
    // Buffer of 31 days before `from` so long stages (e.g. AUTONOMIE 14j)
    // that start before the month but overlap it are still included.
    const gte = from
      ? new Date(new Date(from).getTime() - 31 * 24 * 60 * 60 * 1000)
      : undefined;
    const lte = to ? new Date(to) : undefined;
    where.startDate = { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
  }

  // Type filter (comma-separated: "INITIATION,PROGRESSION,DOUBLE")
  if (types) {
    const typeList = types.split(",").map((t) => t.trim()).filter(Boolean);
    if (typeList.length > 0) where.type = { in: typeList as StageType[] };
  }

  try {
    const now = new Date();

    // 1. Récupérer les stages avec le comptage des bookings (plus léger que de tout charger)
    const stages = await prisma.stage.findMany({
      where,
      select: {
        id: true,
        startDate: true,
        type: true,
        price: true,
        acomptePrice: true, // Requis pour le backoffice (détails)
        duration: true,
        places: true,
        promotionOriginalPrice: true,
        promotionEndDate: true,
        _count: {
          select: { bookings: true }, // Requis pour la logique de places restantes
        },
        moniteurs: {
          select: {
            moniteur: {
              select: {
                id: true,
                name: true,
                role: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // 2. Récupérer tous les CartItems pertinents en une seule requête groupée
    // On ne compte que ceux qui ne sont pas expirés
    const cartItemsCounts = await prisma.cartItem.groupBy({
      by: ["stageId"],
      where: {
        type: "STAGE",
        stageId: { in: stages.map((s) => s.id) },
        expiresAt: { gt: now },
        isExpired: false,
      },
      _count: {
        _all: true,
      },
    });

    // Créer une map pour accès rapide : stageId -> count
    const pendingCartItemsMap = new Map<string, number>();
    cartItemsCounts.forEach((item) => {
      if (item.stageId) {
        pendingCartItemsMap.set(item.stageId, item._count._all);
      }
    });

    // 3. Assembler les données en mémoire
    const enrichedStages = stages.map((stage) => {
      const confirmedBookings = stage._count.bookings;
      const pendingCartItems = pendingCartItemsMap.get(stage.id) || 0;

      const availablePlaces =
        stage.places - confirmedBookings - pendingCartItems;

      const { _count, ...stageData } = stage;

      return {
        ...stageData,
        availablePlaces: Math.max(0, availablePlaces),
        confirmedBookings,
        pendingCartItems,
      };
    });

    return c.json({ success: true, message: "", data: enrichedStages });
  } catch (error) {
    console.error("Error in getAll stages:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la récupération des stages",
      data: null,
    });
  }
}
