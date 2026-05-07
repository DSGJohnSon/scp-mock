import "server-only";
import prisma from "@/lib/prisma";
import { StageBookingType } from "@prisma/client";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/resend";

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

export function prepareEmailData(order: any) {
  let depositTotal = 0;
  let remainingTotal = 0;
  const futurePayments: Array<{
    amount: number;
    date: string;
    description: string;
    participantName: string;
  }> = [];

  order.orderItems.forEach((item: any) => {
    if (item.type === "STAGE") {
      const deposit = item.depositAmount || 0;
      const remaining = item.remainingAmount || 0;
      depositTotal += deposit;
      remainingTotal += remaining;

      if (remaining > 0) {
        const participantName =
          `${item.participantData?.firstName || ""} ${item.participantData?.lastName || ""}`.trim();
        futurePayments.push({
          amount: remaining,
          date: item.stage?.startDate,
          description: `Solde Stage ${item.stage?.type}`,
          participantName,
        });
      }
    }
  });

  depositTotal = Math.max(0, depositTotal - (order.discountAmount || 0));

  const firstParticipant = order.orderItems[0]?.participantData;
  const customerName = firstParticipant
    ? `${firstParticipant.firstName || ""} ${firstParticipant.lastName || ""}`.trim()
    : "Client";
  const customerPhone = firstParticipant?.phone || "Non spécifié";

  return {
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    customerEmail: order.customerEmail || order.client?.email || "non-specifie@placeholder.local",
    customerName,
    customerPhone,
    orderItems: order.orderItems,
    depositTotal,
    remainingTotal,
    totalAmount: order.totalAmount,
    discountAmount: order.discountAmount || 0,
    promoDiscountAmount: order.promoDiscountAmount || 0,
    promoCode: order.promoCode?.code ?? null,
    futurePayments,
  };
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

    const emailData = prepareEmailData(orderWithBookings ?? order);

    try {
      await sendOrderConfirmationEmail(emailData);
      console.log(`[ORDER-PROCESSING] ✅ Confirmation email sent for order ${order.orderNumber}`);
    } catch (emailError) {
      console.error(`[ORDER-PROCESSING] ⚠️ Failed to send confirmation email:`, emailError);
    }

    try {
      await sendAdminNewOrderEmail(emailData);
      console.log(`[ORDER-PROCESSING] ✅ Admin notification email sent`);
    } catch (adminEmailError) {
      console.error(`[ORDER-PROCESSING] ⚠️ Failed to send admin notification email:`, adminEmailError);
    }

    console.log(`[ORDER-PROCESSING] ✅ Order ${order.orderNumber} finalized successfully`);
  } catch (error) {
    console.error(`[ORDER-PROCESSING] ❌ Error finalizing order ${order.orderNumber}:`, error);
    throw error;
  }
}
