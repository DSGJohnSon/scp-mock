import "server-only";
import prisma from "@/lib/prisma";
import { StageBookingType } from "@prisma/client";

export async function findOrCreateStagiaire(participantData: any) {
  let stagiaire = await prisma.stagiaire.findFirst({
    where: { email: participantData.email },
  });

  const stagiaireData = {
    firstName: participantData.firstName,
    lastName: participantData.lastName,
    email: participantData.email,
    phone: participantData.phone,
    weight: participantData.weight,
    height: participantData.height,
    birthDate: participantData.birthDate ? new Date(participantData.birthDate) : null,
  };

  if (!stagiaire) {
    stagiaire = await prisma.stagiaire.create({ data: stagiaireData });
    console.log(`Stagiaire created: ${stagiaire.id} (${stagiaire.email})`);
  } else {
    stagiaire = await prisma.stagiaire.update({ where: { id: stagiaire.id }, data: stagiaireData });
    console.log(`Stagiaire updated: ${stagiaire.id} (${stagiaire.email})`);
  }

  return stagiaire;
}

const SHORT_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateShortCodeCandidate(): string {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += SHORT_CODE_CHARS[Math.floor(Math.random() * SHORT_CODE_CHARS.length)];
  }
  return `SCP-${suffix}`;
}

export async function generateUniqueShortCode(): Promise<string> {
  let code: string;
  let exists = true;
  do {
    code = generateShortCodeCandidate();
    const existing = await prisma.stageBooking.findUnique({ where: { shortCode: code } });
    exists = !!existing;
  } while (exists);
  return code;
}

export async function allocatePaymentToOrderItems(payment: any, orderItems: any[]) {
  console.log(
    `Allocating payment ${payment.id} (${payment.amount}€) to ${orderItems.length} items`,
  );

  let totalBase = 0;
  for (const item of orderItems) {
    if (item.type === "STAGE") {
      totalBase += item.effectiveDepositAmount ?? item.depositAmount ?? 0;
    }
  }

  for (const item of orderItems) {
    if (item.type !== "STAGE") continue;

    const itemBase = item.effectiveDepositAmount ?? item.depositAmount ?? 0;
    if (itemBase <= 0 || totalBase <= 0) continue;

    const allocatedAmount = Math.round((payment.amount * (itemBase / totalBase)) * 100) / 100;

    await prisma.paymentAllocation.create({
      data: { paymentId: payment.id, orderItemId: item.id, allocatedAmount },
    });

    console.log(
      `✓ Allocated ${allocatedAmount}€ from payment ${payment.id} to item ${item.id} [base=${itemBase}/${totalBase}]`,
    );
  }
}

export async function createBookingsFromOrder(order: any) {
  console.log(
    `[ORDER-PROCESSING] 🎯 createBookingsFromOrder called for order ${order.id} with ${order.orderItems.length} items`,
  );

  for (const item of order.orderItems) {
    if (item.type === "STAGE" && item.stageId && !item.stageBookingId) {
      const stagiaire = await findOrCreateStagiaire(item.participantData);

      // If stage is DOUBLE, use the participant's chosen type (INITIATION or PROGRESSION)
      const stageType = item.participantData.selectedStageType || item.stage?.type || "INITIATION";
      const validStageType = stageType === "DOUBLE" ? "INITIATION" : stageType;

      const shortCode = await generateUniqueShortCode();
      const booking = await prisma.stageBooking.create({
        data: {
          stageId: item.stageId,
          stagiaireId: stagiaire.id,
          type: validStageType as StageBookingType,
          shortCode,
        },
      });

      await prisma.orderItem.update({
        where: { id: item.id },
        data: { stageBookingId: booking.id },
      });

      console.log(`Stage booking created: ${booking.id} for stagiaire ${stagiaire.id}`);
    }
  }
}

export async function clearCart(sessionId: string) {
  console.log(`[ORDER-PROCESSING] 🧹 Clearing cart for session: ${sessionId}`);

  const cartSession = await prisma.cartSession.findUnique({
    where: { sessionId },
    include: { cartItems: true },
  });

  if (cartSession && cartSession.cartItems.length > 0) {
    await prisma.cartItem.deleteMany({ where: { cartSessionId: cartSession.id } });
    console.log(
      `[ORDER-PROCESSING] Cart cleared for session: ${cartSession.id} (${cartSession.cartItems.length} items removed)`,
    );
  } else if (cartSession) {
    console.log(`[ORDER-PROCESSING] Cart already cleared for session: ${cartSession.id}`);
  } else {
    console.log(`[ORDER-PROCESSING] Cart session not found: ${sessionId}`);
  }
}

export async function finalizeOrder(order: any, sessionId?: string) {
  console.log(`[ORDER-PROCESSING] 🎯 Finalizing order ${order.orderNumber} (${order.id})`);

  try {
    await createBookingsFromOrder(order);

    if (sessionId) {
      await clearCart(sessionId);
    }

    const orderWithBookings = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: { stage: true, stageBooking: true },
        },
        client: true,
        promoCode: true,
      },
    });

    console.log(`[ORDER-PROCESSING] ✅ Order ${order.orderNumber} finalized successfully`);
  } catch (error) {
    console.error(`[ORDER-PROCESSING] ❌ Error finalizing order ${order.orderNumber}:`, error);
    throw error;
  }
}
