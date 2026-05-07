"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { CartItem } from "@/lib/types/cart";

export interface AppliedPromo {
  id: string;
  code: string;
  label: string;
  discountAmount: number;
  applicableProductTypes: string[];
}

export function usePromoCode(cartItems: CartItem[]) {
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const { toast } = useToast();

  // Re-valide le code promo à chaque changement du panier (ajout vidéo, suppression d'item…)
  useEffect(() => {
    if (!appliedPromo) return;
    const revalidate = async () => {
      const cartItemsBreakdown = cartItems.map((item) => ({
        type: item.type as "STAGE",
        isGiftVoucherCovered: !!item.participantData?.usedGiftVoucherCode,
        amount: item.stage?.price ?? 0,
      }));
      const cartTotal = cartItemsBreakdown.reduce(
        (sum, i) => sum + i.amount,
        0,
      );
      const cartSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.stage?.price ?? 0),
        0,
      );
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/promocodes/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
            body: JSON.stringify({
              code: appliedPromo.code,
              cartTotal,
              cartSubtotal,
              cartItems: cartItemsBreakdown,
            }),
          },
        );
        const result = await res.json();
        if (result.success) {
          setAppliedPromo((prev) =>
            prev
              ? { ...prev, discountAmount: result.data.discountAmount }
              : null,
          );
        } else {
          setAppliedPromo(null);
        }
      } catch {
        // Échec silencieux — on garde le montant actuel
      }
    };
    revalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, appliedPromo?.code]);

  const applyPromoCode = async (depositTotal: number) => {
    if (!promoCodeInput.trim()) return;
    if (depositTotal === 0) {
      toast({
        title: "Code promo non applicable",
        description: "Votre panier est déjà gratuit.",
        variant: "destructive",
      });
      return;
    }
    setIsApplyingPromo(true);
    try {
      const cartItemsBreakdown = cartItems.map((item) => ({
        type: item.type as "STAGE",
        isGiftVoucherCovered: !!item.participantData?.usedGiftVoucherCode,
        amount: item.stage?.price ?? 0,
      }));
      const cartTotal = cartItemsBreakdown.reduce(
        (sum, i) => sum + i.amount,
        0,
      );
      const cartSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.stage?.price ?? 0),
        0,
      );

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/promocodes/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            code: promoCodeInput.trim().toUpperCase(),
            cartTotal,
            cartSubtotal,
            cartItems: cartItemsBreakdown,
          }),
        },
      );
      const result = await res.json();
      if (result.success) {
        setAppliedPromo({
          id: result.data.promoCode.id,
          code: result.data.promoCode.code,
          label: result.data.promoCode.label ?? result.data.promoCode.code,
          discountAmount: result.data.discountAmount,
          applicableProductTypes:
            result.data.promoCode.applicableProductTypes ?? [],
        });
        toast({
          title: "Code promo appliqué !",
          description: `Réduction de ${result.data.discountAmount.toFixed(2)}€`,
        });
      } else {
        toast({
          title: "Code invalide",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le code promo",
        variant: "destructive",
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const clearPromoCode = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
  };

  return {
    promoCodeInput,
    setPromoCodeInput,
    isApplyingPromo,
    appliedPromo,
    applyPromoCode,
    clearPromoCode,
  };
}
