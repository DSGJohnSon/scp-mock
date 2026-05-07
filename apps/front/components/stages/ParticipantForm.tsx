"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Clock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  acomptePrice?: number | null;
  type: string;
  promotionOriginalPrice?: number | null;
}

export interface ParticipantFormData {
  participantType: "self" | "other";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
}

interface ParticipantFormProps {
  slot: Stage;
  categoryLabel: string;
  isLoading: boolean;
  onSubmit: (data: ParticipantFormData) => Promise<void>;
  onBack: () => void;
}

export function ParticipantForm({
  slot,
  categoryLabel,
  isLoading,
  onSubmit,
  onBack,
}: ParticipantFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ParticipantFormData>({ defaultValues: { participantType: "self" } });

  const participantType = watch("participantType");

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      setValue("firstName", d.firstName || "");
      setValue("lastName", d.lastName || "");
      setValue("email", d.email || "");
      setValue("phone", d.phone || "");
      setValue("weight", d.weight || "");
      setValue("height", d.height || "");
      setValue("birthDate", d.birthDate || "");
    } catch {
      /* ignore */
    }
  }, [setValue]);

  const isPromo = !!(slot.promotionOriginalPrice && slot.price < slot.promotionOriginalPrice);

  return (
    <div
      id="participant-form"
      className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Vos informations
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Renseignez les informations du participant pour finaliser la réservation
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Pour qui */}
        <div className="space-y-4">
          <Label className="text-base font-semibold text-slate-800">
            Pour qui réservez-vous ?
          </Label>
          <RadioGroup
            defaultValue="self"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onValueChange={(v) => setValue("participantType", v as "self" | "other")}
          >
            {(["self", "other"] as const).map((val) => (
              <div key={val} className="relative">
                <RadioGroupItem value={val} id={val} className="peer sr-only" />
                <Label
                  htmlFor={val}
                  className={cn(
                    "flex items-center justify-center p-5 bg-slate-50 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-100",
                    participantType === val
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200",
                  )}
                >
                  <div className="text-center">
                    <div
                      className={cn(
                        "font-semibold text-base",
                        participantType === val ? "text-blue-700" : "text-slate-800",
                      )}
                    >
                      {val === "self" ? "Pour moi" : "Pour quelqu'un d'autre"}
                    </div>
                    <div
                      className={cn(
                        "text-xs mt-1",
                        participantType === val ? "text-blue-600" : "text-slate-500",
                      )}
                    >
                      {val === "self"
                        ? "Mes informations seront sauvegardées"
                        : "Cadeau ou réservation tierce"}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Informations participant */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-slate-800">
            Informations {participantType === "self" ? "personnelles" : "du participant"}
          </h3>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
              Identité
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  {...register("firstName", { required: "Prénom requis" })}
                  placeholder={participantType === "self" ? "Votre prénom" : "Prénom du participant"}
                  className="mt-1"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  {...register("lastName", { required: "Nom requis" })}
                  placeholder={participantType === "self" ? "Votre nom" : "Nom du participant"}
                  className="mt-1"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="birthDate">Date de naissance *</Label>
              <Input
                id="birthDate"
                type="date"
                {...register("birthDate", { required: "Requise" })}
                className="mt-1"
              />
              {errors.birthDate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
              Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email requis" })}
                  placeholder="email@exemple.com"
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  {...register("phone", { required: "Requis" })}
                  placeholder="06 12 34 56 78"
                  className="mt-1"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
              Informations physiques
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Poids (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  {...register("weight", {
                    required: "Requis",
                    min: { value: 20, message: "Min 20kg" },
                    max: { value: 120, message: "Max 120kg" },
                  })}
                  placeholder="70"
                  className="mt-1"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="height">Taille (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  {...register("height", {
                    required: "Requise",
                    min: { value: 120, message: "Min 120cm" },
                    max: { value: 220, message: "Max 220cm" },
                  })}
                  placeholder="175"
                  className="mt-1"
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Récapitulatif</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Stage {categoryLabel}</span>
              <div className="text-right">
                {isPromo && (
                  <span className="text-sm text-slate-400 line-through block">
                    {slot.promotionOriginalPrice}€
                  </span>
                )}
                <span className="font-semibold text-slate-800">{slot.price}€</span>
              </div>
            </div>
            <hr className="border-slate-300" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-slate-800">Total</span>
              <span className="font-bold text-2xl text-blue-600">{slot.price}€</span>
            </div>
            {slot.acomptePrice && (
              <>
                <hr className="border-dashed border-slate-200" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Acompte à régler aujourd&apos;hui</span>
                  <span className="font-semibold text-slate-800">{slot.acomptePrice}€</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Solde à régler sur place</span>
                  <span className="text-slate-600">{slot.price - slot.acomptePrice}€</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12"
            size="lg"
          >
            Modifier le créneau
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 h-12" size="lg">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" /> Ajout en cours…
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Ajouter au panier
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
