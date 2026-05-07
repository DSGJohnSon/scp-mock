import type { CartItem } from "@/lib/types/cart";

interface AppliedPromo {
  discountAmount: number;
  applicableProductTypes: string[];
}

export function computePromoShares(
  cartItems: CartItem[],
  appliedPromo: AppliedPromo,
): Map<string, number> {
  const map = new Map<string, number>();
  if (appliedPromo.discountAmount <= 0) return map;

  const types = appliedPromo.applicableProductTypes;
  const getFullPrice = (item: CartItem) => (item.stage?.price ?? 0) * item.quantity;

  // Sort identique au serveur : prix DESC (le moins cher en dernier absorbe l'arrondi)
  const applicable = cartItems
    .filter((item) => {
      if (item.participantData?.usedGiftVoucherCode) return false;
      if (types.length > 0 && !types.includes(item.type)) return false;
      return true;
    })
    .sort((a, b) => getFullPrice(b) - getFullPrice(a));

  const applicableTotal = applicable.reduce((sum, item) => sum + getFullPrice(item), 0);
  if (applicableTotal === 0) return map;

  let assigned = 0;
  for (let i = 0; i < applicable.length; i++) {
    const item = applicable[i];
    if (i === applicable.length - 1) {
      map.set(item.id, Math.max(0, appliedPromo.discountAmount - assigned));
    } else {
      const share = Math.floor(
        (appliedPromo.discountAmount * getFullPrice(item)) / applicableTotal,
      );
      map.set(item.id, share);
      assigned += share;
    }
  }
  return map;
}
