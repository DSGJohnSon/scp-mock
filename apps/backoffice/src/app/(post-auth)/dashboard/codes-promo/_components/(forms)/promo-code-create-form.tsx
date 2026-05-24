"use client";

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
  CreatePromoCodeSchema,
  type CreatePromoCode,
} from "@/features/promocodes/schemas";
import { useCreatePromoCode } from "@/features/promocodes/api/use-create-promocode";

interface PromoCodeCreateFormProps {
  onSuccess: () => void;
}

export function PromoCodeCreateForm({ onSuccess }: PromoCodeCreateFormProps) {
  const createPromoCode = useCreatePromoCode();

  const form = useForm<CreatePromoCode>({
    resolver: zodResolver(CreatePromoCodeSchema),
    defaultValues: {
      code: "",
      label: "",
      recipientNote: "",
      discountType: "FIXED",
      discountValue: 0,
      maxDiscountAmount: undefined,
      minCartAmount: undefined,
      maxUses: undefined,
      isActive: true,
      applicableProductTypes: [],
    },
  });

  const discountType = form.watch("discountType");

  const onSubmit = async (data: CreatePromoCode) => {
    await createPromoCode.mutateAsync(data);
    form.reset();
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code *</FormLabel>
              <FormControl>
                <Input
                  placeholder="EX: PROMO25, HIVER2025…"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                />
              </FormControl>
              <FormDescription>Le code que le client saisira au checkout</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormDescription>Visible uniquement dans le backoffice</FormDescription>
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
                  placeholder="Ex: Créé pour M. Dupont suite à son email du 01/03"
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
                <FormLabel>Type de réduction *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormLabel>Valeur * {discountType === "PERCENTAGE" ? "(%)" : "(€)"}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={discountType === "PERCENTAGE" ? 1 : 0.01}
                    step={discountType === "PERCENTAGE" ? 1 : 0.01}
                    max={discountType === "PERCENTAGE" ? 100 : undefined}
                    placeholder={discountType === "PERCENTAGE" ? "15" : "20.00"}
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
                    placeholder="Ex: 50 → réduction max de 50€"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormDescription>La réduction ne dépassera jamais ce montant</FormDescription>
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
                    placeholder="Ex: 50"
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
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormDescription>Laisser vide pour une durée illimitée</FormDescription>
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
                <FormLabel>Activer immédiatement</FormLabel>
                <FormDescription>Le code sera utilisable dès sa création</FormDescription>
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
            onClick={() => {
              form.reset();
              onSuccess();
            }}
          >
            Annuler
          </Button>
          <Button type="submit" className="flex-1" disabled={createPromoCode.isPending}>
            {createPromoCode.isPending && (
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            )}
            Créer le code
          </Button>
        </div>
      </form>
    </Form>
  );
}
