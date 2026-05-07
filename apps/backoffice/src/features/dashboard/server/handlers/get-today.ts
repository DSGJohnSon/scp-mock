import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetToday(c: Context) {
  try {
    const userId = c.get("userId");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return c.json(
        { success: false, message: "User not found", data: null },
        404
      );
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const isAdmin = user.role === "ADMIN";

    const stageWhere = isAdmin
      ? { startDate: { lte: endOfDay } }
      : {
          startDate: { lte: endOfDay },
          moniteurs: { some: { moniteurId: user.id } },
        };

    const stagesRaw = await prisma.stage.findMany({
      where: stageWhere,
      include: {
        bookings: {
          include: {
            stagiaire: true,
            orderItem: true,
          },
        },
        moniteurs: { include: { moniteur: { select: { id: true, name: true } } } },
      },
      orderBy: { startDate: "asc" },
    });

    // Keep only stages where today falls within [startDate, startDate + duration days)
    const stages = stagesRaw.filter((stage) => {
      const endDate = new Date(stage.startDate.getTime() + stage.duration * 24 * 60 * 60 * 1000);
      return endDate > startOfDay;
    });

    const formattedStages = stages.map((stage) => ({
      id: stage.id,
      type: stage.type,
      startDate: stage.startDate,
      duration: stage.duration,
      places: stage.places,
      bookingsCount: stage.bookings.length,
      moniteurs: stage.moniteurs.map((m) => ({ id: m.moniteur.id, name: m.moniteur.name })),
      participants: stage.bookings.map((booking) => {
        const oi = booking.orderItem;
        const isFullyPaid = oi?.isFullyPaid ?? false;
        const totalPrice = oi?.totalPrice ?? 0;
        const depositAmount = oi?.depositAmount ?? null;
        const remainingAmount = oi?.remainingAmount ?? null;
        const effectiveRemainingAmount = oi?.effectiveRemainingAmount ?? null;

        let amountPaid: number;
        if (isFullyPaid) {
          amountPaid = totalPrice;
        } else {
          const remaining = effectiveRemainingAmount ?? remainingAmount ?? 0;
          amountPaid = totalPrice - remaining;
        }

        return {
          bookingId: booking.id,
          orderItemId: oi?.id ?? null,
          shortCode: booking.shortCode ?? null,
          firstName: booking.stagiaire.firstName,
          lastName: booking.stagiaire.lastName,
          email: booking.stagiaire.email,
          phone: booking.stagiaire.phone,
          weight: booking.stagiaire.weight,
          height: booking.stagiaire.height,
          bookingType: booking.type,
          totalPrice,
          depositAmount,
          remainingAmount,
          effectiveRemainingAmount,
          isFullyPaid,
          amountPaid,
        };
      }),
    }));

    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    return c.json({
      success: true,
      data: {
        date: dateStr,
        stages: formattedStages,
      },
    });
  } catch (error) {
    console.error("Error fetching today activities:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching today activities",
        data: null,
      },
      500
    );
  }
}
