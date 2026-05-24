export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "FULLY_PAID"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Acompte payé",
  PARTIALLY_PAID: "Acompte payé",
  FULLY_PAID: "Entièrement payée",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  PARTIALLY_PAID: "bg-blue-100 text-blue-800 border-blue-200",
  FULLY_PAID: "bg-green-200 text-green-900 border-green-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement",
  CASH: "Espèces",
  CHECK: "Chèque",
};

export const ITEM_TYPE_LABELS: Record<string, string> = {
  STAGE: "Stage",
  BAPTEME: "Baptême",
  GIFT_VOUCHER: "Bon cadeau",
};

export interface AppOrderItem {
  id: string;
  type: string;
  quantity: number;
  totalPrice: number;
  isFullyPaid: boolean;
  discountAmount: number | null;
  finalDiscountAmount: number | null;
  effectiveDepositAmount: number | null;
  stage: { type: string; startDate: Date } | null;
  stageBooking: { stagiaire: { firstName: string; lastName: string } | null } | null;
}

export interface AppPayment {
  id: string;
  status: string;
  amount: number;
  createdAt: Date;
  isManual: boolean;
  manualPaymentMethod: string | null;
  manualPaymentNote: string | null;
  stripePaymentIntentId: string | null;
}

export interface AppOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: Date;
  totalAmount: number;
  subtotal: number;
  promoDiscountAmount: number;
  client: { id: string; firstName: string; lastName: string; email: string } | null;
  orderItems: AppOrderItem[];
  payments: AppPayment[];
}
