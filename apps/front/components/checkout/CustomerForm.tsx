"use client";

import type {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, MapPin, User } from "lucide-react";
import { ReservationTimer } from "@/components/checkout/ReservationTimer";
import type { CartItem } from "@/lib/types/cart";
import type { AppliedPromo } from "@/hooks/usePromoCode";
import {
  getItemTitle,
  getStageDeposit,
} from "@/lib/pricing";
import { computePromoShares } from "@/lib/promo-allocation";

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  acceptedCGV: boolean;
  acceptedMarketing: boolean;
}

interface CheckoutTotals {
  depositTotal: number;
  remainingTotal: number;
}

interface CustomerFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  handleSubmit: UseFormHandleSubmit<CheckoutFormData>;
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isCreatingOrder: boolean;
  cartItems: CartItem[];
  totals: CheckoutTotals;
  appliedPromo: AppliedPromo | null;
  onBack: () => void;
}

export function CustomerForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isCreatingOrder,
  cartItems,
  totals,
  appliedPromo,
  onBack,
}: CustomerFormProps) {
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const todayAmount = Math.max(0, totals.depositTotal - discountAmount);

  const promoSharesMap = appliedPromo
    ? computePromoShares(cartItems, appliedPromo)
    : new Map<string, number>();

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
      {/* Colonne gauche — Formulaire (2/3) */}
      <div className="lg:col-span-2">
        {cartItems.some((item) => item.type === "STAGE" && item.expiresAt) && (
          <div className="mb-4">
            <ReservationTimer cartItems={cartItems} compact />
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">
              Vos informations
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Renseignez vos coordonnées pour finaliser la réservation
            </p>
          </div>

          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-6"
          >
            {/* Contact */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName", { required: "Prénom requis" })}
                    placeholder="Jean"
                    className="mt-1"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName", { required: "Nom requis" })}
                    placeholder="Dupont"
                    className="mt-1"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email requis" })}
                  placeholder="jean.dupont@email.com"
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  {...register("phone", { required: "Téléphone requis" })}
                  placeholder="06 12 34 56 78"
                  className="mt-1"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Adresse */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Adresse
              </h2>
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  {...register("address", { required: "Adresse requise" })}
                  placeholder="123 Rue de la Paix"
                  className="mt-1"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    {...register("postalCode", {
                      required: "Code postal requis",
                    })}
                    placeholder="75001"
                    className="mt-1"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    {...register("city", { required: "Ville requise" })}
                    placeholder="Paris"
                    className="mt-1"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="country">Pays *</Label>
                <Input
                  id="country"
                  {...register("country", { required: "Pays requis" })}
                  placeholder="France"
                  defaultValue="France"
                  className="mt-1"
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Consentements RGPD */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Consentements
              </h2>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="acceptedCGV"
                  {...register("acceptedCGV", {
                    required: "Vous devez accepter les CGV pour continuer",
                  })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <Label
                    htmlFor="acceptedCGV"
                    className="cursor-pointer text-sm text-gray-700"
                  >
                    J&apos;accepte les{" "}
                    <a
                      href="/cgv"
                      target="_blank"
                      className="underline text-blue-600"
                    >
                      CGV
                    </a>{" "}
                    et la{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="underline text-blue-600"
                    >
                      Politique de confidentialité
                    </a>{" "}
                    *
                  </Label>
                  {errors.acceptedCGV && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.acceptedCGV.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="acceptedMarketing"
                  {...register("acceptedMarketing")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor="acceptedMarketing"
                  className="cursor-pointer text-sm text-gray-700"
                >
                  J&apos;accepte de recevoir des offres commerciales de Serre
                  Chevalier Parapente{" "}
                  <span className="text-gray-400 text-xs">(optionnel)</span>
                </Label>
              </div>
            </div>

            {/* Bouton paiement — visible mobile uniquement */}
            <Button
              type="submit"
              className="w-full lg:hidden bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-md"
              disabled={isCreatingOrder}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isCreatingOrder
                ? "Création en cours…"
                : `Payer ${todayAmount.toFixed(2)}€`}
            </Button>
          </form>
        </div>
      </div>

      {/* Colonne droite — Récapitulatif sticky (1/3) */}
      <div className="space-y-4 lg:sticky lg:top-6 h-fit">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-700">
              Récapitulatif
            </h3>
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-blue-600 hover:underline"
            >
              Modifier
            </button>
          </div>
          <SummaryLines />
        </div>

        {/* Bouton paiement desktop */}
        <Button
          type="submit"
          form="checkout-form"
          className="w-full hidden lg:flex bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-md"
          disabled={isCreatingOrder}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isCreatingOrder
            ? "Création en cours…"
            : `Payer ${todayAmount.toFixed(2)}€`}
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
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>🔒 Paiement sécurisé SSL</span>
          <span>•</span>
          <span>Stripe</span>
        </div>
      </div>
    </div>
  );
}
