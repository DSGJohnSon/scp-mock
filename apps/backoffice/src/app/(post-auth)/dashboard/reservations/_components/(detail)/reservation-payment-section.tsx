"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EuroSignIcon,
  CreditCardIcon2,
  CheckCircleIcon,
  AlertTriangleIcon,
  TagIcon,
  PlusIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrencyPrecise } from "@/lib/formatting";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Espèces",
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement",
  CHECK: "Chèque",
};

export interface PaymentEntry {
  id: string;
  status: string;
  isManual: boolean;
  amount: number;
  currency: string;
  createdAt: string;
  allocatedAmount: number;
  stripePaymentIntentId: string | null;
  manualPaymentMethod: string | null;
  manualPaymentNote: string | null;
  recordedByUser: { name: string } | null;
}

interface ReservationPaymentSectionProps {
  totalPrice: number;
  promoDiscount: number;
  promoCode: string | undefined;
  giftVoucher: { code: string } | null | undefined;
  totalOnlinePaid: number;
  totalManualPaid: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  payments: PaymentEntry[];
  orderItemId: string | undefined;
  onAddPayment: () => void;
}

export function ReservationPaymentSection({
  totalPrice,
  promoDiscount,
  promoCode,
  giftVoucher,
  totalOnlinePaid,
  totalManualPaid,
  remainingAmount,
  isFullyPaid,
  payments,
  orderItemId,
  onAddPayment,
}: ReservationPaymentSectionProps) {
  const settled = isFullyPaid || remainingAmount === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <EuroSignIcon className="size-4" />
            Paiements
          </CardTitle>
          {!settled && orderItemId && (
            <Button size="sm" onClick={onAddPayment}>
              <PlusIcon className="size-4 mr-1.5" />
              Enregistrer un paiement
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Résumé financier */}
        <div className="rounded-lg border overflow-hidden divide-y">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
            <span className="text-sm font-medium">Prix total du stage</span>
            <span className="font-bold">{formatCurrencyPrecise(totalPrice)}</span>
          </div>

          {(promoDiscount > 0 || giftVoucher) && (
            <div className="flex items-center justify-between px-4 py-3 bg-green-50">
              <div className="flex items-center gap-2">
                <TagIcon className="size-4 text-green-700" />
                <span className="text-sm font-medium text-green-800">
                  {giftVoucher
                    ? `Bon cadeau (${giftVoucher.code})`
                    : `Code promo${promoCode ? ` ${promoCode}` : ""}`}
                </span>
              </div>
              <span className="text-sm font-bold text-green-700">
                -{formatCurrencyPrecise(giftVoucher ? totalPrice : promoDiscount)}
              </span>
            </div>
          )}

          {totalOnlinePaid > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50">
              <div className="flex items-center gap-2">
                <CreditCardIcon2 className="size-4 text-blue-700" />
                <span className="text-sm font-medium text-blue-800">Acompte en ligne</span>
              </div>
              <span className="text-sm font-bold text-blue-700">
                {formatCurrencyPrecise(totalOnlinePaid)}
              </span>
            </div>
          )}

          {totalManualPaid > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="size-4 text-slate-700" />
                <span className="text-sm font-medium text-slate-800">Paiements manuels</span>
              </div>
              <span className="text-sm font-bold text-slate-700">
                {formatCurrencyPrecise(totalManualPaid)}
              </span>
            </div>
          )}

          <div
            className={`flex items-center justify-between px-4 py-3 ${
              settled ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {settled ? (
                <CheckCircleIcon className="size-4 text-green-700" />
              ) : (
                <AlertTriangleIcon className="size-4 text-orange-700" />
              )}
              <span
                className={`text-sm font-semibold ${
                  settled ? "text-green-800" : "text-orange-800"
                }`}
              >
                {settled ? "Solde soldé" : "Solde restant à payer"}
              </span>
            </div>
            <span
              className={`text-base font-bold ${
                settled ? "text-green-700" : "text-orange-700"
              }`}
            >
              {settled ? "✓ Soldé" : formatCurrencyPrecise(remainingAmount)}
            </span>
          </div>
        </div>

        {/* Historique */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CreditCardIcon2 className="size-4" />
            Historique des paiements
          </h4>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun paiement enregistré
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="secondary">
                        {payment.isManual ? "Manuel" : "En ligne"}
                      </Badge>
                      {payment.isManual && payment.manualPaymentMethod && (
                        <Badge variant="outline">
                          {PAYMENT_METHOD_LABELS[payment.manualPaymentMethod] ?? payment.manualPaymentMethod}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {payment.isManual ? (
                      <div className="space-y-0.5">
                        {payment.recordedByUser && (
                          <p className="text-xs text-muted-foreground">
                            Enregistré par{" "}
                            <span className="font-medium">{payment.recordedByUser.name}</span>
                          </p>
                        )}
                        {payment.manualPaymentNote && (
                          <p className="text-xs text-muted-foreground italic">
                            {payment.manualPaymentNote}
                          </p>
                        )}
                      </div>
                    ) : (
                      payment.stripePaymentIntentId && (
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[220px]">
                          {payment.stripePaymentIntentId}
                        </p>
                      )
                    )}
                  </div>
                  <p className="text-lg font-bold shrink-0">
                    {formatCurrencyPrecise(payment.allocatedAmount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
