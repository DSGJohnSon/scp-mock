// HTTP response contract for GET /api/reservations/:id
// Only fields actually consumed by reservation-details.tsx are included.
// Dates are typed as string — they arrive serialised from JSON.

interface ReservationDetailMoniteur {
  id: string;
  moniteur: { name: string };
}

interface ReservationDetailActivity {
  duration: number;
  places: number;
  moniteurs: ReservationDetailMoniteur[];
  startDate?: string; // stage
  date?: string;      // bapteme
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
  // PaymentAllocation.paymentId is a required FK — payment is always present
  payment: ReservationDetailPayment;
}

interface ReservationDetailOrder {
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
  finalDiscountAmount: number | null;
  finalDiscountNote: string | null;
  finalDiscountDate: string | null;
  discountAmount: number | null;
  usedGiftVoucher: { code: string } | null;
  paymentAllocations: ReservationDetailPaymentAllocation[];
  order: ReservationDetailOrder;
}

interface ReservationDetailBooking {
  stagiaire: ReservationDetailStagiaire;
  orderItem: ReservationDetailOrderItem | null;
  stage: ReservationDetailActivity;
  type: string;
  // Bapteme-only (handler currently always returns STAGE; kept for type-safety of dead branches)
  bapteme?: ReservationDetailActivity;
  category?: string;
  hasVideo?: boolean;
}

export interface ReservationDetail {
  type: string;
  booking: ReservationDetailBooking;
  availablePlaces: {
    total: number;
    confirmed: number;
    remaining: number;
  } | null;
}
