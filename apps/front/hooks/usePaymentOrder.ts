"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface PaymentOrderItem {
  type: string;
  stage?: any;
  participantData?: any;
  totalPrice?: number;
  effectiveDepositAmount?: number;
  effectiveRemainingAmount?: number;
  depositAmount?: number;
  discountAmount?: number;
}

interface RemainingPayment {
  type: string;
  itemType: string;
  itemDate: string;
  remainingAmount: number;
  participantName: string;
}

export interface PaymentOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  orderItems?: PaymentOrderItem[];
  depositAmount: number;
  remainingAmount: number;
}

export function usePaymentOrder(orderId: string | null, clientSecretParam: string | null) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [remainingPayments, setRemainingPayments] = useState<RemainingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrderDetails = async (orderIdParam: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/orders/${orderIdParam}`,
        { headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" } },
      );
      const data = await response.json();

      if (data.success) {
        const orderData = data.data;
        let depositAmount = 0;
        let remainingAmount = 0;
        const remainingPaymentsList: RemainingPayment[] = [];

        orderData.orderItems?.forEach((item: PaymentOrderItem) => {
          if (item.participantData?.usedGiftVoucherCode) return;

          if (item.type === "STAGE" && item.stage) {
            const stageDeposit =
              item.effectiveDepositAmount ??
              item.stage.acomptePrice ??
              Math.round(item.stage.price * 0.33);
            depositAmount += stageDeposit;
            const remaining =
              item.effectiveRemainingAmount ??
              item.stage.price - (item.depositAmount ?? item.stage.acomptePrice ?? 0);
            if (remaining > 0) {
              remainingAmount += remaining;
              remainingPaymentsList.push({
                type: "STAGE",
                itemType: item.stage.type,
                itemDate: item.stage.startDate,
                remainingAmount: remaining,
                participantName: `${item.participantData?.firstName || ""} ${item.participantData?.lastName || ""}`.trim(),
              });
            }
          } else {
            depositAmount += item.totalPrice ?? 0;
          }
        });

        setOrder({ ...orderData, depositAmount, remainingAmount });
        setRemainingPayments(remainingPaymentsList);

        if (!clientSecretParam) {
          toast({
            title: "Erreur",
            description:
              "Client secret manquant. Veuillez recommencer le processus de paiement.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erreur",
          description: "Commande introuvable",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur chargement commande:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { order, remainingPayments, loading };
}
