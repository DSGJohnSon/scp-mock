export type PaymentType = "STRIPE" | "MANUAL";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";
export type ManualPaymentMethod = "CARD" | "BANK_TRANSFER" | "CASH" | "CHECK";
export type OrderItemType = "STAGE" | "BAPTEME";
export type StageType = "INITIATION" | "PROGRESSION" | "AUTONOMIE" | "DOUBLE";

export interface AppPaymentAllocation {
  id: string;
  allocatedAmount: number;
  orderItem: {
    id: string;
    type: OrderItemType;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    stage?: {
      id: string;
      startDate: Date;
      type: StageType;
    } | null;
    stageBooking?: {
      id: string;
      stagiaire: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    } | null;
  };
}

export interface AppPayment {
  id: string;
  amount: number;
  status: PaymentStatus;
  paymentType: PaymentType | null;
  isManual: boolean | null;
  manualPaymentMethod: ManualPaymentMethod | null;
  manualPaymentNote: string | null;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    orderNumber: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  } | null;
  recordedByUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  allocations: AppPaymentAllocation[];
}
