"use client";

import { useMemo, useState } from "react";
import { AppPayment } from "../_types";

export const usePaiementsPage = (payments: AppPayment[] | null) => {
  const [searchStripeId, setSearchStripeId] = useState("");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    const stripeQuery = searchStripeId.trim().toLowerCase();
    const orderQuery = searchOrderNumber.trim().toLowerCase();
    return payments.filter((p) => {
      const matchesStripe =
        !stripeQuery ||
        (p.stripePaymentIntentId?.toLowerCase().includes(stripeQuery) ?? false);
      const matchesOrder =
        !orderQuery ||
        (p.order?.orderNumber?.toLowerCase().includes(orderQuery) ?? false);
      return matchesStripe && matchesOrder;
    });
  }, [payments, searchStripeId, searchOrderNumber]);

  const stats = useMemo(() => {
    if (!payments) return { totalEncaisse: 0, countStripe: 0, countManuel: 0 };
    return {
      totalEncaisse: payments
        .filter((p) => p.status === "SUCCEEDED")
        .reduce((sum, p) => sum + p.amount, 0),
      countStripe: payments.filter(
        (p) => p.paymentType === "STRIPE" || (!p.paymentType && !p.isManual),
      ).length,
      countManuel: payments.filter(
        (p) => p.paymentType === "MANUAL" || p.isManual,
      ).length,
    };
  }, [payments]);

  return {
    searchStripeId,
    setSearchStripeId,
    searchOrderNumber,
    setSearchOrderNumber,
    filteredPayments,
    stats,
  };
};
