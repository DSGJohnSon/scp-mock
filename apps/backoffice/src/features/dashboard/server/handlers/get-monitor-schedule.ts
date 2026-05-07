import { Context } from "hono";
import prisma from "@/lib/prisma";

export async function handleGetMonitorSchedule(c: Context) {
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

    const stagesRaw = await prisma.stage.findMany({
      where: {
        startDate: { lte: endOfDay },
        moniteurs: { some: { moniteurId: user.id } },
      },
      include: {
        bookings: {
          include: {
            stagiaire: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Keep only stages where today falls within [startDate, startDate + duration days)
    const stages = stagesRaw.filter((stage) => {
      const endDate = new Date(stage.startDate.getTime() + stage.duration * 24 * 60 * 60 * 1000);
      return endDate > startOfDay;
    });

    const nextStage = await prisma.stage.findFirst({
      where: {
        startDate: { gt: endOfDay },
        moniteurs: { some: { moniteurId: user.id } },
      },
      orderBy: { startDate: "asc" },
      include: {
        bookings: {
          include: {
            stagiaire: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const formattedStages = stages.map((stage) => ({
      id: stage.id,
      startDate: stage.startDate,
      duration: stage.duration,
      type: stage.type,
      bookingsCount: stage.bookings.length,
      participants: stage.bookings.map((booking) => ({
        id: booking.id,
        name: `${booking.stagiaire.firstName} ${booking.stagiaire.lastName}`,
        email: booking.stagiaire.email,
        phone: booking.stagiaire.phone,
      })),
    }));

    const formattedNextStage = nextStage
      ? {
          id: nextStage.id,
          startDate: nextStage.startDate,
          duration: nextStage.duration,
          type: nextStage.type,
          bookingsCount: nextStage.bookings.length,
          participants: nextStage.bookings.map((booking) => ({
            id: booking.id,
            name: `${booking.stagiaire.firstName} ${booking.stagiaire.lastName}`,
            email: booking.stagiaire.email,
            phone: booking.stagiaire.phone,
          })),
        }
      : null;

    return c.json({
      success: true,
      data: {
        stages: formattedStages,
        upcoming: {
          nextStage: formattedNextStage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching monitor schedule:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching monitor schedule",
        data: null,
      },
      500
    );
  }
}
