// HTTP response contract for GET /api/reservations/:id

interface ReservationDetailMoniteur {
  id: string;
  moniteur: { name: string };
}

interface ReservationDetailActivity {
  id: string;
  type: string;
  duration: number;
  places: number;
  moniteurs: ReservationDetailMoniteur[];
  startDate: string;
}

interface ReservationDetailStagiaire {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate: string | null;
}

interface ReservationDetailClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
}

interface ReservationDetailPayment {
  id: string;
  status: string;
  isManual: boolean;
  amount: number;
  currency: string;
  createdAt: string;
  stripePaymentIntentId: string | null;
  manualPaymentMethod: string | null;
  manualPaymentNote: string | null;
  recordedByUser: { name: string } | null;
}

interface ReservationDetailPaymentAllocation {
  id: string;
  allocatedAmount: number;
  payment: ReservationDetailPayment;
}

interface ReservationDetailOrder {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  promoDiscountAmount: number | null;
  promoCode: { code: string } | null;
  client: ReservationDetailClient | null;
}

interface ReservationDetailOrderItem {
  id: string;
  totalPrice: number;
  depositAmount: number;
  isFullyPaid: boolean;
  finalPaymentDate: string | null;
  finalPaymentNote: string | null;
  discountAmount: number | null;
  usedGiftVoucher: { code: string } | null;
  paymentAllocations: ReservationDetailPaymentAllocation[];
  order: ReservationDetailOrder;
}

interface ReservationDetailBooking {
  id: string;
  status: "CONFIRMED" | "CANCELLED";
  stagiaire: ReservationDetailStagiaire;
  orderItem: ReservationDetailOrderItem | null;
  stage: ReservationDetailActivity;
  type: string;
}

export interface ReservationDetail {
  type: "STAGE";
  booking: ReservationDetailBooking;
  availablePlaces: {
    total: number;
    confirmed: number;
    remaining: number;
  } | null;
}
