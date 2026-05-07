// HTTP response contract for GET /api/orders/:id/details
// Only top-level fields accessed directly by order-details.tsx are typed here.
// orderItems / payments are unknown[] — all accesses go through (x: any) callback
// annotations in the component, which are outside the as-any cleanup scope.

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  promoDiscountAmount: number | null;
  promoCode: { code: string } | null;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
  } | null;
  payments: unknown[];
  orderItems: unknown[];
}
