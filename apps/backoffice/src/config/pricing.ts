import { StageType } from "@prisma/client";

export const STAGE_DEFAULT_PRICES: Record<StageType, { price: number; acomptePrice: number }> = {
  [StageType.INITIATION]: { price: 680, acomptePrice: 230 },
  [StageType.PROGRESSION]: { price: 680, acomptePrice: 230 },
  [StageType.AUTONOMIE]: { price: 1200, acomptePrice: 400 },
  [StageType.DOUBLE]: { price: 680, acomptePrice: 230 },
};
