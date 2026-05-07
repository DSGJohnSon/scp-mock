import type { CartItem } from "@/lib/types/cart";

export const getStageDeposit = (stage: any): number =>
  stage?.acomptePrice || Math.round((stage?.price || 0) * 0.33);

export const getStageRemaining = (stage: any): number =>
  (stage?.price || 0) - getStageDeposit(stage);

export const getItemPrice = (item: CartItem): number => {
  if (item.participantData?.usedGiftVoucherCode) return 0;
  return item.stage?.price || 0;
};

export const getItemTitle = (item: CartItem): string => {
  const stageType =
    item.participantData?.selectedStageType || item.stage?.type;
  return `Stage ${stageType} - ${new Date(
    item.stage?.startDate,
  ).toLocaleDateString("fr-FR")}`;
};
