export interface PromoCode {
  id: string;
  code: string;
  label: string | null;
  recipientNote: string | null;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number;
  maxDiscountAmount: number | null;
  minCartAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  expiryDate: Date | null;
  isActive: boolean;
  applicableProductTypes: string[];
  campaignId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED" | "MAXED";

export type PromoStatus = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
};
