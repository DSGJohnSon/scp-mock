"use client";

interface FuturePayment {
  amount: number;
  date: string;
  description: string;
  participantName: string;
}

interface FuturePaymentsListProps {
  payments: FuturePayment[];
  remainingTotal: number;
  formatDate: (d: string) => string;
}

export function FuturePaymentsList({
  payments,
  remainingTotal,
  formatDate,
}: FuturePaymentsListProps) {
  if (remainingTotal <= 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-2">
        <span className="text-amber-500 text-base leading-none mt-0.5">ℹ️</span>
        <div className="space-y-2 text-xs text-amber-900 flex-1">
          <p>
            <strong>
              Solde total à régler sur place : {remainingTotal.toFixed(2)}€
            </strong>
          </p>
          <p>
            Les soldes sont à régler directement sur place le jour de chaque
            activité.
          </p>
          <div className="space-y-2 pt-1">
            {payments.map((payment, index) => (
              <div key={index} className="border-l-2 border-amber-300 pl-3">
                <p className="font-semibold">{payment.participantName}</p>
                <div className="flex justify-between items-center">
                  <span className="text-amber-700">
                    {payment.description} — {formatDate(payment.date)}
                  </span>
                  <span className="font-bold text-amber-900 ml-2">
                    {payment.amount.toFixed(2)}€
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
