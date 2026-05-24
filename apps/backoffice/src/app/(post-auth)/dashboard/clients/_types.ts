export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "FULLY_PAID"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED";

export interface AppOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  createdAt: string;
}

export interface AppClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  orders: AppOrder[];
}
