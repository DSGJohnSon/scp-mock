import { PaymentsList } from "@/features/payments/components/payments-list";

export default function PaymentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-16">
      <PaymentsList />
    </main>
  );
}