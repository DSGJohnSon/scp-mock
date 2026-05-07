"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EuroSignIcon,
  TagIcon,
  CreditCardIcon2,
  CheckCircleIcon,
  AlertTriangleIcon,
  PercentIcon2,
  PlusIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";
import { getPaymentStatusBadge, getPaymentMethodLabel, getStatusLabel } from "./reservation-utils";

export interface PaymentEntry {
  id?: string | null;
  status: string;
  isManual?: boolean | null;
  manualPaymentMethod?: string | null;
  manualPaymentNote?: string | null;
  stripePaymentIntentId?: string | null;
  createdAt: string | Date;
  amount: number;
  currency?: string | null;
  allocatedAmount?: number | null;
  recordedByUser?: { name: string } | null;
}

interface GiftVoucherInfo {
  code: string;
}

interface ReservationPaymentHistoryProps {
  isFullyPaid: boolean;
  dynamicRemainingAmount: number;
  totalPrice: number;
  hasVideo: boolean;
  isStage: boolean;
  itemPromoDiscount: number;
  usedGiftVoucher?: GiftVoucherInfo | null;
  promoCodeUsed?: string;
  totalOnlinePaid: number;
  depositDate: Date | null;
  finalDiscountAmount: number;
  finalDiscountNote?: string;
  finalDiscountDate: Date | null;
  totalManualPaid: number;
  finalPaymentDate?: string | Date | null;
  finalPaymentNote?: string | null;
  payments: PaymentEntry[];
  onRegisterPayment: () => void;
}

export function ReservationPaymentHistory({
  isFullyPaid,
  dynamicRemainingAmount,
  totalPrice,
  hasVideo,
  isStage,
  itemPromoDiscount,
  usedGiftVoucher,
  promoCodeUsed,
  totalOnlinePaid,
  depositDate,
  finalDiscountAmount,
  finalDiscountNote,
  finalDiscountDate,
  totalManualPaid,
  finalPaymentDate,
  finalPaymentNote,
  payments,
  onRegisterPayment,
}: ReservationPaymentHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <EuroSignIcon className="h-5 w-5" />
              Informations de paiement
            </CardTitle>
            <CardDescription>
              Historique complet des paiements pour cette réservation
            </CardDescription>
          </div>
          {!isFullyPaid && dynamicRemainingAmount > 0 && (
            <Button
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white"
              onClick={onRegisterPayment}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <EuroSignIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Prix total {isStage ? "du stage" : "du baptême"}
                {hasVideo && " (+ vidéo)"}
              </span>
            </div>
            <span className="text-base font-bold">{formatCurrency(totalPrice)}</span>
          </div>

          {(itemPromoDiscount > 0 || usedGiftVoucher) && (
            <div className="flex items-start justify-between px-4 py-3 bg-green-50 border-t">
              <div className="flex items-start gap-2">
                <TagIcon className="h-4 w-4 text-green-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {usedGiftVoucher
                      ? `Bon cadeau utilisé (${usedGiftVoucher.code})`
                      : `Code promo${promoCodeUsed ? ` ${promoCodeUsed}` : ""}`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-700">
                {usedGiftVoucher
                  ? `-${formatCurrency(totalPrice)}`
                  : `-${formatCurrency(itemPromoDiscount)}`}
              </span>
            </div>
          )}

          {totalOnlinePaid > 0 && (
            <div className="flex items-start justify-between px-4 py-3 border-t bg-blue-50">
              <div className="flex items-start gap-2">
                <CreditCardIcon2 className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Acompte versé en ligne</p>
                  {depositDate && (
                    <p className="text-xs text-blue-700">
                      {format(depositDate, "dd/MM/yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-blue-700">
                {formatCurrency(totalOnlinePaid)}
              </span>
            </div>
          )}

          {finalDiscountAmount > 0 && (
            <div className="flex items-start justify-between px-4 py-3 border-t bg-amber-50">
              <div className="flex items-start gap-2">
                <PercentIcon2 className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Réduction finale</p>
                  {finalDiscountNote && (
                    <p className="text-xs text-amber-700 italic">{finalDiscountNote}</p>
                  )}
                  {finalDiscountDate && (
                    <p className="text-xs text-amber-700">
                      {format(finalDiscountDate, "dd/MM/yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-amber-700">
                -{formatCurrency(finalDiscountAmount)}
              </span>
            </div>
          )}

          {totalManualPaid > 0 && (
            <div className="flex items-start justify-between px-4 py-3 border-t bg-slate-50">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-4 w-4 text-slate-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Montant réglé en fin d&apos;activité
                  </p>
                  {finalPaymentDate && (
                    <p className="text-xs text-slate-600">
                      {format(new Date(finalPaymentDate), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-slate-700">
                {formatCurrency(totalManualPaid)}
              </span>
            </div>
          )}

          <div
            className={`flex items-center justify-between px-4 py-3 border-t ${
              isFullyPaid || dynamicRemainingAmount === 0 ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {isFullyPaid || dynamicRemainingAmount === 0 ? (
                <CheckCircleIcon className="h-4 w-4 text-green-700" />
              ) : (
                <AlertTriangleIcon className="h-4 w-4 text-orange-700" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isFullyPaid || dynamicRemainingAmount === 0 ? "text-green-800" : "text-orange-800"
                }`}
              >
                {isFullyPaid || dynamicRemainingAmount === 0 ? "Solde soldé" : "Solde restant à payer"}
              </span>
            </div>
            <span
              className={`text-lg font-bold ${
                isFullyPaid || dynamicRemainingAmount === 0 ? "text-green-700" : "text-orange-700"
              }`}
            >
              {isFullyPaid || dynamicRemainingAmount === 0
                ? "✓ Soldé"
                : formatCurrency(dynamicRemainingAmount)}
            </span>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CreditCardIcon2 className="h-4 w-4" />
            Historique des paiements
          </h4>
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun paiement enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={getPaymentStatusBadge(payment.status)}>
                        {getStatusLabel(payment.status)}
                      </Badge>
                      {payment.isManual && (
                        <Badge variant="outline">
                          {getPaymentMethodLabel(payment.manualPaymentMethod ?? "")}
                        </Badge>
                      )}
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(payment.createdAt), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {payment.isManual ? (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Paiement manuel pour cette réservation
                        </p>
                        {payment.recordedByUser && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Enregistré par:{" "}
                            <span className="font-medium">{payment.recordedByUser.name}</span>
                          </p>
                        )}
                        {payment.manualPaymentNote && (
                          <p className="text-xs sm:text-sm text-muted-foreground italic">
                            Note: {payment.manualPaymentNote}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Paiement en ligne (part allouée à cette réservation)
                        </p>
                        {payment.stripePaymentIntentId && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
                            ID Stripe: {payment.stripePaymentIntentId}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right shrink-0 border-t sm:border-0 pt-2 sm:pt-0">
                    <p className="text-xl font-bold">
                      {formatCurrency(payment.allocatedAmount ?? payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">{payment.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final Payment Note */}
        {finalPaymentDate && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              Paiement final en physique
            </h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm mb-2">
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="font-medium">
                  {format(new Date(finalPaymentDate), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </p>
              {finalPaymentNote && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Note:</span>{" "}
                  <span className="font-medium">{finalPaymentNote}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
