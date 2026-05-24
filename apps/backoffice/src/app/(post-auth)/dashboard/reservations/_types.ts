export type BookingStatus = "CONFIRMED" | "CANCELLED";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "FULLY_PAID"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED";

export type BookingStatusFilter = "ALL" | "CONFIRMED" | "CANCELLED";

export interface AppReservationListItem {
  id: string;
  type: "INITIATION" | "PROGRESSION" | "AUTONOMIE";
  status: BookingStatus;
  createdAt: string;
  stagiaire: {
    firstName: string;
    lastName: string;
    email: string;
  };
  stage: {
    id: string;
    startDate: string;
    type: string;
    duration: number;
  };
  orderItem: {
    id: string;
    totalPrice: number;
    depositAmount: number;
    remainingAmount: number;
    isFullyPaid: boolean;
    discountAmount: number | null;
    order: {
      id: string;
      orderNumber: string;
      status: OrderStatus;
    };
  } | null;
}
