"use client";

import { useState, useEffect } from "react";

export type ParticipantData = {
  email?: string;
  phone?: string;
  height?: number;
  weight?: number;
  hasVideo?: boolean;
  lastName?: string;
  firstName?: string;
  birthDate?: string;
  selectedCategory?: string;
  selectedStageType?: string;
  usedGiftVoucherCode?: string | null;
};

export type Stage = {
  id?: string;
  startDate?: string;
  duration?: number;
  places?: number;
  price?: number;
  acomptePrice?: number;
  type?: string;
};

export type OrderItem = {
  id: string;
  type: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
  stageId?: string | null;
  participantData?: ParticipantData | null;
  stage?: Stage | null;
  depositAmount?: number | null;
  remainingAmount?: number | null;
  isFullyPaid?: boolean;
  stageBooking?: any;
};

export type ConfirmedOrder = {
  id: string;
  orderNumber: string;
  status?: string;
  subtotal?: number;
  discountAmount?: number;
  totalAmount: number;
  clientId?: string;
  appliedGiftCardId?: string | null;
  createdAt: string;
  updatedAt?: string;
  customerEmail?: string | null;
  orderItems?: OrderItem[];
  payments?: any[];
};

export function useOrderConfirmation(orderId: string | null) {
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Google Ads Conversion Tracking
  useEffect(() => {
    if (order) {
      const alreadyTracked = localStorage.getItem(`order_tracked_${order.id}`);
      if (!alreadyTracked && typeof window !== "undefined") {
        const dataLayer = (window as any).dataLayer || [];
        dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: order.id,
            value: order.totalAmount,
            currency: "EUR",
            items: (order.orderItems || []).map((item: OrderItem) => ({
              item_id: item.id || "",
              price: item.totalPrice || 0,
              item_name:
                item.type + (item.stage ? ` ${item.stage.type ?? ""}` : ""),
              item_category: item.type === "STAGE" ? "Stage" : item.type,
              quantity: 1,
            })),
          },
        });
        localStorage.setItem(`order_tracked_${order.id}`, "true");
      }
    }
  }, [order]);

  const loadOrderDetails = async (orderIdParam: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/orders/${orderIdParam}`,
        { headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" } },
      );
      const data = await response.json();
      if (data.success) setOrder(data.data);
    } catch (error) {
      console.error("[SUCCESS PAGE] ❌ Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  return { order, loading };
}
