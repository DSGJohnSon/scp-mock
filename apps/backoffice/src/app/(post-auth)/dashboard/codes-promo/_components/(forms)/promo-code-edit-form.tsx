"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EuroSignIcon, LoaderIcon, PercentIcon2 } from "@/lib/icons";
import {
  UpdatePromoCodeSchema,
  type UpdatePromoCode,
} from "@/features/promocodes/schemas";
import { useUpdatePromoCode } from "@/features/promocodes/api/use-update-promocode";
import { PromoCode } from "../../_types";

interface PromoCodeEditFormProps {
  promoCode: PromoCode;
  onSuccess: () => void;
}

export function PromoCodeEditForm({ promoCode, onSuccess }: PromoCodeEditFormProps) {
  const updatePromoCode = useUpdatePromoCode();

  const form = useForm<UpdatePromoCode>({
    resolver: zodResolver(UpdatePromoCodeSchema),
    defaultValues: {},
  });

  const discountType = form.watch("discountType");

  useEffect(() => {
    form.reset({
      label: promoCode.label ?? "",
      recipientNote: promoCode.recipientNote ?? "",
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      maxDiscountAmount: promoCode.maxDiscountAmount ?? undefined,
      minCartAmount: promoCode.minCartAmount ?? undefined,
      maxUses: promoCode.maxUses ?? undefined,
      expiryDate: promoCode.expiryDate ?? undefined,
      isActive: promoCode.isActive,
      applicableProductTypes: promoCode.applicableProductTypes ?? [],
    });
  }, [promoCode, form]);

  const onSubmit = async (data: UpdatePromoCode) => {
    await updatePromoCode.mutateAsync({ param: { id: promoCode.id }, json: data });
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Code non-éditable */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Code</p>
          <p className="font-mono font-bold text-sm bg-muted px-3 py-2 rounded-md inline-block">
            {promoCode.code}
          </p>
        </div>

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label interne</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Promo hiver 2025"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recipientNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note destinataire</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
                  rows={2}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de réduction</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FIXED">
                      <div className="flex items-center gap-2">
                        <EuroSignIcon className="h-4 w-4" />
                        Montant fixe (€)
                      </div>
                    </SelectItem>
                    <SelectItem value="PERCENTAGE">
                      <div className="flex items-center gap-2">
                        <PercentIcon2 className="h-4 w-4" />
                        Pourcentage (%)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valeur {discountType === "PERCENTAGE" ? "(%)" : "(€)"}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={discountType === "PERCENTAGE" ? 1 : 0.01}
                    step={discountType === "PERCENTAGE" ? 1 : 0.01}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {discountType === "PERCENTAGE" && (
          <FormField
            control={form.control}
            name="maxDiscountAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plafond de réduction (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minCartAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Panier min (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nb max d&apos;utilisations</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="∞ illimité"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d&apos;expiration</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={
                    field.value ? new Date(field.value).toISOString().split("T")[0] : ""
                  }
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : null)
                  }
                />
              </FormControl>
              <FormDescription>Laisser vide pour durée illimitée</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicableProductTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produits applicables</FormLabel>
              <FormDescription>
                Laisser vide pour un code valable sur tous les produits
              </FormDescription>
              <div className="flex flex-col gap-2 pt-1">
                {([{ value: "STAGE", label: "Stages" }] as const).map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={(field.value ?? []).includes(value)}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? [];
                        field.onChange(
                          checked ? [...current, value] : current.filter((v) => v !== value),
                        );
                      }}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Code actif</FormLabel>
                <FormDescription>
                  Désactivez pour suspendre le code sans le supprimer
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onSuccess}
          >
            Annuler
          </Button>
          <Button type="submit" className="flex-1" disabled={updatePromoCode.isPending}>
            {updatePromoCode.isPending && (
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}
