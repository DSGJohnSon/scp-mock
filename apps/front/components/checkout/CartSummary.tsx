"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  CreditCard,
  Loader2,
  Mountain,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { EditableParticipantDetails } from "@/components/checkout/EditableParticipantDetails";
import { ReservationTimer } from "@/components/checkout/ReservationTimer";
import type { CartItem } from "@/lib/types/cart";
import type { AppliedPromo } from "@/hooks/usePromoCode";
import {
  getItemTitle,
  getStageDeposit,
  getStageRemaining,
} from "@/lib/pricing";
import { computePromoShares } from "@/lib/promo-allocation";

interface CheckoutTotals {
  depositTotal: number;
  remainingTotal: number;
}

interface CartSummaryProps {
  cartItems: CartItem[];
  expandedDetails: Record<string, boolean>;
  onToggleExpanded: (id: string) => void;
  onDeleteClick: (item: CartItem) => void;
  onReloadCart: () => void;
  appliedPromo: AppliedPromo | null;
  promoCodeInput: string;
  onPromoCodeChange: (v: string) => void;
  onApplyPromo: () => void;
  isApplyingPromo: boolean;
  onClearPromo: () => void;
  onContinue: () => void;
  totals: CheckoutTotals;
}

function getSectionInfo(_type: string) {
  return {
    title: "Stages",
    icon: Mountain,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  };
}

export function CartSummary({
  cartItems,
  expandedDetails,
  onToggleExpanded,
  onDeleteClick,
  onReloadCart,
  appliedPromo,
  promoCodeInput,
  onPromoCodeChange,
  onApplyPromo,
  isApplyingPromo,
  onClearPromo,
  onContinue,
  totals,
}: CartSummaryProps) {
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const todayAmount = Math.max(0, totals.depositTotal - discountAmount);

  const promoSharesMap = appliedPromo
    ? computePromoShares(cartItems, appliedPromo)
    : new Map<string, number>();

  const groups: Record<string, CartItem[]> = { STAGE: [] };
  cartItems.forEach((item) => {
    if (item.type === "STAGE") groups.STAGE.push(item);
  });

  const SummaryLines = () => (
    <div className="space-y-2">
      {cartItems
        .filter((item) => !item.participantData?.usedGiftVoucherCode)
        .map((item) => {
          const baseDeposit = getStageDeposit(item.stage);
          const promoShare = promoSharesMap.get(item.id) ?? 0;
          const effectiveDeposit = Math.max(0, baseDeposit - promoShare);
          return (
            <div key={item.id} className="space-y-0.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="truncate mr-2 leading-tight">
                  {item.type === "STAGE"
                    ? `Acompte — ${getItemTitle(item)}`
                    : getItemTitle(item)}
                </span>
                <span className="font-medium whitespace-nowrap line-through text-gray-400">
                  {baseDeposit.toFixed(2)}€
                </span>
              </div>
              {promoShare > 0 && (
                <>
                  <div className="flex justify-between text-xs text-green-600 pl-2">
                    <span>Réduction {appliedPromo!.code}</span>
                    <span>-{promoShare.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-800 font-semibold pl-2">
                    <span>→ Acompte effectif</span>
                    <span>{effectiveDeposit.toFixed(2)}€</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      {cartItems
        .filter((item) => item.participantData?.usedGiftVoucherCode)
        .map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-xs text-green-600"
          >
            <span className="truncate mr-2">
              {getItemTitle(item)} (bon cadeau)
            </span>
            <span>0€</span>
          </div>
        ))}
      <Separator className="my-2" />
      <div className="flex justify-between text-sm text-gray-700">
        <span>Acomptes ({appliedPromo ? "après réduction" : "total"})</span>
        <span>{todayAmount.toFixed(2)}€</span>
      </div>
      <Separator className="my-2" />
      <div className="flex justify-between items-baseline">
        <p className="font-bold text-gray-900 text-sm">
          À payer aujourd&apos;hui
        </p>
        <span className="text-xl font-bold text-blue-600">
          {todayAmount.toFixed(2)}€
        </span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche — Articles (2/3) */}
      <div className="lg:col-span-2 space-y-4">
        {cartItems.some((item) => item.type === "STAGE" && item.expiresAt) && (
          <ReservationTimer cartItems={cartItems} />
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
          <span className="text-sm text-gray-500">
            {cartItems.length} article{cartItems.length > 1 ? "s" : ""}
          </span>
        </div>

        {Object.entries(groups).map(([type, items]) => {
          if (items.length === 0) return null;
          const sectionInfo = getSectionInfo(type);
          const IconComponent = sectionInfo.icon;

          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <IconComponent className={`w-4 h-4 ${sectionInfo.color}`} />
                <h2
                  className={`text-xs font-semibold uppercase tracking-widest ${sectionInfo.color}`}
                >
                  {sectionInfo.title}
                </h2>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${sectionInfo.bgColor} flex-shrink-0 mt-0.5`}
                      >
                        <IconComponent
                          className={`w-4 h-4 ${sectionInfo.color}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 leading-tight">
                          {getItemTitle(item)}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pour : {item.participantData.firstName}{" "}
                          {item.participantData.lastName}
                        </p>
                        <button
                          type="button"
                          onClick={() => onToggleExpanded(item.id)}
                          className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          {expandedDetails[item.id] ? "Masquer" : "Voir"} les
                          détails
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${expandedDetails[item.id] ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                        {item.type === "STAGE" &&
                          !item.participantData?.usedGiftVoucherCode && (
                            <div className="text-right">
                              {item.stage?.promotionOriginalPrice &&
                                item.stage.price <
                                  item.stage.promotionOriginalPrice && (
                                  <p className="text-xs text-gray-400 line-through">
                                    {item.stage.promotionOriginalPrice}€
                                  </p>
                                )}
                              <p className="text-sm font-bold text-gray-800">
                                {item.stage?.price}€
                              </p>
                              {(() => {
                                const dep = getStageDeposit(item.stage);
                                const share =
                                  promoSharesMap.get(item.id) ?? 0;
                                const effDep = Math.max(0, dep - share);
                                return (
                                  <>
                                    {share > 0 ? (
                                      <>
                                        <p className="text-xs text-green-600 font-semibold">
                                          Réduction : -{share}€
                                        </p>
                                        <p className="text-xs text-orange-600 font-semibold">
                                          Acompte : {effDep}€
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-xs text-orange-600">
                                        Acompte : {dep}€
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      Solde : {getStageRemaining(item.stage)}€
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        {item.participantData?.usedGiftVoucherCode && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs border">
                            Bon cadeau ✓
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteClick(item)}
                          className="text-gray-300 hover:text-red-500 transition-colors mt-2"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedDetails[item.id] && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <EditableParticipantDetails
                        participantData={item.participantData}
                        type="STAGE"
                        itemId={item.id}
                        onUpdate={() => onReloadCart()}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Colonne droite — Code promo + Récapitulatif + CTA (1/3) */}
      <div className="space-y-4 lg:sticky lg:top-6 h-fit">
        {/* Code promo — masqué si panier déjà gratuit */}
        {totals.depositTotal > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-400" />
              Code promo
            </h3>
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    <strong>{appliedPromo.code}</strong> appliqué
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    -{appliedPromo.discountAmount.toFixed(2)}€ de réduction
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClearPromo}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={promoCodeInput}
                  onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
                  placeholder="Code promo"
                  className="uppercase text-sm"
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), onApplyPromo())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onApplyPromo}
                  disabled={isApplyingPromo || !promoCodeInput.trim()}
                  className="shrink-0"
                >
                  {isApplyingPromo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "OK"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Récapitulatif */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">
            Récapitulatif
          </h3>
          <SummaryLines />
        </div>

        {/* CTA */}
        <Button
          onClick={onContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-md"
        >
          Continuer
          <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
        </Button>

        {/* Info acompte / solde */}
        {totals.remainingTotal > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-base leading-none mt-0.5">
                ℹ️
              </span>
              <div className="space-y-1.5 text-xs text-amber-900">
                <p>
                  <strong>Acompte de {todayAmount.toFixed(2)}€</strong> à
                  régler aujourd&apos;hui pour confirmer votre réservation.
                </p>
                <p>
                  Le solde de{" "}
                  <strong>{totals.remainingTotal.toFixed(2)}€</strong> sera
                  réglé directement sur place le jour de votre activité.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Signaux de confiance */}
        <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
          <span>🔒 SSL</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Stripe
          </span>
          <span>•</span>
          <span>TVA incluse</span>
        </div>
      </div>
    </div>
  );
}
