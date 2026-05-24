import { Context } from "hono";
import prisma from "@/lib/prisma";
import type { AppEnv } from "@/lib/middlewares/types";
import { CreateOrderSchema } from "../../schemas";
import { Prisma } from "@prisma/client";
import { generateOrderNumber, createPaymentIntent } from "@/lib/stripe";
import {
  finalizeOrder,
  allocatePaymentToOrderItems,
} from "@/features/orders/server/helpers/order-processing";
import type { ParticipantData } from "@/lib/participant-data";

export async function handleCreateOrder(c: Context<AppEnv>) {
  try {
    // zValidator in route.ts guarantees shape before this handler is called
    let { customerEmail, customerData, promoCodeId } = c.req.valid("json" as never) as typeof CreateOrderSchema._output;
    const cartSession = c.get("cartSession");

    const cartItems = await prisma.cartItem.findMany({
      where: { cartSessionId: cartSession.id },
      include: { stage: true },
    });

    if (cartItems.length === 0) {
      return c.json({ success: false, message: "Votre panier est vide", data: null });
    }

    // ─── Étape 1 : Pré-calcul des prix par article ──────────────────
    type ItemPriceInfo = {
      unitPrice: number;
      fullPrice: number;
      depositAmt: number | null;
      remainingAmt: number | null;
      isFullyPaid: boolean;
      isGiftVoucherCovered: boolean;
    };
    const itemPriceMap = new Map<string, ItemPriceInfo>();
    let subtotal = 0;
    let depositTotal = 0;

    for (const item of cartItems) {
      const pd = item.participantData as ParticipantData | null;
      const isGVC = !!pd?.usedGiftVoucherCode;
      let info: ItemPriceInfo;

      if (item.type === "STAGE" && item.stage) {
        const fullPrice = item.stage.price * item.quantity;
        subtotal += fullPrice;
        if (isGVC) {
          info = { unitPrice: item.stage.price, fullPrice, depositAmt: 0, remainingAmt: 0, isFullyPaid: true, isGiftVoucherCovered: true };
        } else {
          const dep = item.stage.acomptePrice * item.quantity;
          const rem = (item.stage.price - item.stage.acomptePrice) * item.quantity;
          depositTotal += dep;
          info = { unitPrice: item.stage.price, fullPrice, depositAmt: dep, remainingAmt: rem, isFullyPaid: false, isGiftVoucherCovered: false };
        }
      } else {
        info = { unitPrice: 0, fullPrice: 0, depositAmt: null, remainingAmt: null, isFullyPaid: false, isGiftVoucherCovered: false };
      }
      itemPriceMap.set(item.id, info);
    }

    // ─── Étape 2 : Validation du code promo ──────────────────────────
    let promoDiscount = 0;
    let validatedPromoCode: any = null;

    if (promoCodeId) {
      const promoCode = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });

      if (
        promoCode &&
        promoCode.isActive &&
        (!promoCode.expiryDate || promoCode.expiryDate > new Date()) &&
        (!promoCode.maxUses || promoCode.currentUses < promoCode.maxUses) &&
        (!promoCode.minCartAmount || subtotal >= promoCode.minCartAmount)
      ) {
        let applicableSubtotal = subtotal;
        if (promoCode.applicableProductTypes.length > 0) {
          applicableSubtotal = 0;
          for (const item of cartItems) {
            if (!promoCode.applicableProductTypes.includes(item.type)) continue;
            const info = itemPriceMap.get(item.id);
            if (info && !info.isGiftVoucherCovered) applicableSubtotal += info.fullPrice;
          }
        } else {
          applicableSubtotal = 0;
          for (const item of cartItems) {
            const info = itemPriceMap.get(item.id);
            if (info && !info.isGiftVoucherCovered) applicableSubtotal += info.fullPrice;
          }
        }

        if (promoCode.discountType === "FIXED") {
          promoDiscount = Math.min(promoCode.discountValue, applicableSubtotal);
        } else {
          promoDiscount = applicableSubtotal * (promoCode.discountValue / 100);
          if (promoCode.maxDiscountAmount) {
            promoDiscount = Math.min(promoDiscount, promoCode.maxDiscountAmount);
          }
        }
        promoDiscount = Math.min(promoDiscount, depositTotal);
        promoDiscount = Math.round(promoDiscount * 100) / 100;
        validatedPromoCode = promoCode;
      }
    }

    // ─── Étape 3 : Répartition proportionnelle de la promo par article ─
    const itemPromoShares = new Map<string, number>();

    if (promoDiscount > 0 && validatedPromoCode) {
      const applicableItems = cartItems
        .filter((item) => {
          const info = itemPriceMap.get(item.id);
          if (!info || info.isGiftVoucherCovered) return false;
          if (validatedPromoCode.applicableProductTypes.length > 0) {
            return validatedPromoCode.applicableProductTypes.includes(item.type);
          }
          return true;
        })
        .sort((a, b) => (itemPriceMap.get(b.id)?.fullPrice ?? 0) - (itemPriceMap.get(a.id)?.fullPrice ?? 0));

      const applicableTotal = applicableItems.reduce(
        (sum, item) => sum + (itemPriceMap.get(item.id)?.fullPrice ?? 0),
        0,
      );

      if (applicableTotal > 0) {
        let assigned = 0;
        for (let i = 0; i < applicableItems.length; i++) {
          const item = applicableItems[i];
          const isLast = i === applicableItems.length - 1;
          if (isLast) {
            itemPromoShares.set(item.id, Math.max(0, promoDiscount - assigned));
          } else {
            const itemPrice = itemPriceMap.get(item.id)!.fullPrice;
            const share = Math.floor(promoDiscount * itemPrice / applicableTotal);
            itemPromoShares.set(item.id, share);
            assigned += share;
          }
        }
      }
    }

    const totalAmount = subtotal;
    const depositAmount = Math.max(0, depositTotal - promoDiscount);

    // ─── Créer ou récupérer le client (checkout à 0€) ────────────────
    let client = null;
    if (depositAmount <= 0 && customerEmail && customerData) {
      client = await prisma.client.findUnique({ where: { email: customerEmail } });
      if (!client) {
        client = await prisma.client.create({
          data: {
            email: customerEmail,
            firstName: customerData.firstName || "",
            lastName: customerData.lastName || "",
            phone: customerData.phone || "",
            address: customerData.address || "",
            postalCode: customerData.postalCode || "",
            city: customerData.city || "",
            country: customerData.country || "France",
          },
        });
      }
    }

    // ─── Créer la commande ────────────────────────────────────────────
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: depositAmount <= 0 ? "PAID" : "PENDING",
        subtotal,
        discountAmount: promoDiscount,
        promoDiscountAmount: promoDiscount,
        promoCodeId: validatedPromoCode?.id ?? null,
        totalAmount,
        clientId: client?.id,
        orderItems: {
          create: cartItems.map((item) => {
            const prices = itemPriceMap.get(item.id)!;
            const promoShare = itemPromoShares.get(item.id) ?? 0;

            const effectiveDepositAmt = prices.depositAmt !== null
              ? Math.max(0, prices.depositAmt - promoShare)
              : null;
            const promoExcess = prices.depositAmt !== null
              ? Math.max(0, promoShare - prices.depositAmt)
              : 0;
            const effectiveRemainingAmt = prices.remainingAmt !== null
              ? Math.max(0, prices.remainingAmt - promoExcess)
              : null;

            return {
              type: item.type,
              quantity: item.quantity,
              unitPrice: prices.unitPrice,
              totalPrice: prices.fullPrice,
              depositAmount: prices.depositAmt,
              remainingAmount: prices.remainingAmt,
              isFullyPaid: prices.isFullyPaid,
              discountAmount: promoShare,
              effectiveDepositAmount: effectiveDepositAmt,
              effectiveRemainingAmount: effectiveRemainingAmt,
              stageId: item.stageId,
              participantData: item.participantData as Prisma.InputJsonValue,
            };
          }),
        },
      },
      include: { orderItems: true },
    });

    if (validatedPromoCode) {
      await Promise.all([
        prisma.promoCodeUsage.create({
          data: {
            promoCodeId: validatedPromoCode.id,
            orderId: order.id,
            discountApplied: promoDiscount,
          },
        }),
        prisma.promoCode.update({
          where: { id: validatedPromoCode.id },
          data: { currentUses: { increment: 1 } },
        }),
      ]);
    }

    const remainingPayments = cartItems
      .filter((item) => item.type === "STAGE" && item.stage)
      .map((item) => ({
        type: "STAGE" as const,
        itemId: item.stage!.id,
        itemDate: item.stage!.startDate,
        remainingAmount: (item.stage!.price - item.stage!.acomptePrice) * item.quantity,
        dueDate: item.stage!.startDate,
      }));

    const totalRemainingAmount = remainingPayments.reduce(
      (sum, payment) => sum + payment.remainingAmount,
      0,
    );

    if (depositAmount === 0) {
      // CAS 1 : COMMANDE GRATUITE (100% couverte par bon cadeau)
      console.log(
        `[ORDER-CREATE] 🎁 Free order detected (depositAmount = 0€) for order ${order.orderNumber}`,
      );

      const totalPaidByVouchers = order.orderItems.reduce(
        (sum: number, item: any) => {
          if (item.participantData?.usedGiftVoucherCode) {
            return sum + (item.totalPrice || 0);
          }
          return sum;
        },
        0,
      );

      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentType: "MANUAL",
          status: "SUCCEEDED",
          amount: totalPaidByVouchers,
          currency: "eur",
        },
      });

      console.log(
        `[ORDER-CREATE] ✓ GIFT_VOUCHER payment created: ${payment.id} (${payment.amount}€)`,
      );

      await allocatePaymentToOrderItems(payment, order.orderItems);

      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          orderItems: { include: { stage: true } },
          client: true,
        },
      });

      if (!fullOrder) {
        throw new Error("Order not found after creation");
      }

      await finalizeOrder(fullOrder, cartSession.sessionId);

      console.log(
        `[ORDER-CREATE] ✅ Free order ${order.orderNumber} finalized successfully`,
      );

      return c.json({
        success: true,
        message: "Commande créée avec succès (paiement par bon cadeau)",
        data: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            subtotal: order.subtotal,
            discountAmount: order.discountAmount,
            depositAmount: 0,
            remainingAmount: totalRemainingAmount,
            customerEmail: customerEmail,
            status: order.status,
            createdAt: order.createdAt,
          },
          paymentIntent: null,
          requiresPayment: false,
          remainingPayments: remainingPayments,
        },
      });
    } else {
      // CAS 2 : COMMANDE PAYANTE (Stripe)
      console.log(
        `[ORDER-CREATE] 💳 Paid order detected (depositAmount = ${depositAmount}€) for order ${order.orderNumber}`,
      );

      const paymentIntent = await createPaymentIntent({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: depositAmount,
        sessionId: cartSession.sessionId,
        customerEmail: customerEmail,
        customerData: customerData,
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentType: "STRIPE",
          stripePaymentIntentId: paymentIntent.id,
          status: "PENDING",
          amount: depositAmount,
          currency: "eur",
        },
      });

      console.log(
        `[ORDER-CREATE] ✓ Stripe payment created: ${paymentIntent.id}`,
      );

      return c.json({
        success: true,
        message: "Commande créée avec succès",
        data: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            subtotal: order.subtotal,
            discountAmount: order.discountAmount,
            depositAmount: depositAmount,
            remainingAmount: totalRemainingAmount,
            customerEmail: customerEmail,
            status: order.status,
            createdAt: order.createdAt,
          },
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount,
          },
          requiresPayment: true,
          remainingPayments: remainingPayments,
        },
      });
    }
  } catch (error) {
    console.error("Erreur création commande:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création de la commande",
        data: null,
      },
      500,
    );
  }
}
