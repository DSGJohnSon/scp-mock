"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EuroSignIcon,
  TagIcon,
  CreditCardIcon2,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "@/lib/icons";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";

interface OrderPaymentSummaryProps {
  subtotal: number;
  promoDiscountAmount: number;
  promoCode?: string;
  totalGiftVoucherCovered: number;
  totalOnlinePaid: number;
  totalManualPaid: number;
  totalRemaining: number;
  isFullyPaid: boolean;
}

export function OrderPaymentSummary({
  subtotal,
  promoDiscountAmount,
  promoCode,
  totalGiftVoucherCovered,
  totalOnlinePaid,
  totalManualPaid,
  totalRemaining,
  isFullyPaid,
}: OrderPaymentSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <EuroSignIcon className="h-5 w-5" />
          Récapitulatif financier
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          <div className="flex justify-between px-6 py-3">
            <span className="text-sm text-muted-foreground">Sous-total</span>
            <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {promoDiscountAmount > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-green-50">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-green-700" />
                <span className="text-sm text-green-800">
                  Code promo{promoCode ? ` ${promoCode}` : ""}
                  <span className="text-xs text-green-600 ml-1">(sur acompte)</span>
                </span>
              </div>
              <span className="text-sm font-semibold text-green-700">
                -{formatCurrency(promoDiscountAmount)}
              </span>
            </div>
          )}

          {totalGiftVoucherCovered > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-green-50">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-green-700" />
                <span className="text-sm text-green-800">Couvert par bons cadeaux</span>
              </div>
              <span className="text-sm font-semibold text-green-700">
                -{formatCurrency(totalGiftVoucherCovered)}
              </span>
            </div>
          )}

          {totalOnlinePaid > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-blue-50">
              <div className="flex items-center gap-2">
                <CreditCardIcon2 className="h-4 w-4 text-blue-700" />
                <span className="text-sm text-blue-800">Acompte payé en ligne (Stripe)</span>
              </div>
              <span className="text-sm font-semibold text-blue-700">
                {formatCurrency(totalOnlinePaid)}
              </span>
            </div>
          )}

          {totalManualPaid > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-slate-700" />
                <span className="text-sm text-slate-800">Règlements manuels (sur place)</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {formatCurrency(totalManualPaid)}
              </span>
            </div>
          )}

          <div
            className={`flex items-center justify-between px-6 py-3 ${
              isFullyPaid ? "bg-green-100" : "bg-orange-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {isFullyPaid ? (
                <CheckCircleIcon className="h-4 w-4 text-green-700" />
              ) : (
                <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isFullyPaid ? "text-green-800" : "text-orange-800"
                }`}
              >
                {isFullyPaid ? "Soldé" : "Solde restant"}
              </span>
            </div>
            <span
              className={`font-bold text-base ${
                isFullyPaid ? "text-green-700" : "text-orange-700"
              }`}
            >
              {isFullyPaid ? "✓ Soldé" : formatCurrency(totalRemaining)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
