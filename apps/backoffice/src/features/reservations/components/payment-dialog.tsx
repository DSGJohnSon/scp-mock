"use client";

import { useState } from "react";
import { useRecordManualPayment } from "@/features/reservations/api/use-record-manual-payment";
import { useRecordFinalDiscount } from "@/features/reservations/api/use-record-final-discount";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangleIcon, EuroSignIcon, PercentIcon2, PlusIcon } from "@/lib/icons";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItemId: string;
  remainingAmount: number;
  onSuccess: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

export function PaymentDialog({
  open,
  onOpenChange,
  orderItemId,
  remainingAmount,
  onSuccess,
}: PaymentDialogProps) {
  const recordManualPayment = useRecordManualPayment();
  const recordFinalDiscount = useRecordFinalDiscount();

  const [mode, setMode] = useState<"payment" | "discount">("payment");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "BANK_TRANSFER" | "CASH" | "CHECK">("CASH");
  const [paymentNote, setPaymentNote] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountNote, setDiscountNote] = useState("");

  const isPending = recordManualPayment.isPending || recordFinalDiscount.isPending;

  const resetForm = () => {
    setMode("payment");
    setPaymentAmount("");
    setPaymentMethod("CASH");
    setPaymentNote("");
    setDiscountAmount("");
    setDiscountNote("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  const handleSubmit = async () => {
    try {
      if (mode === "discount") {
        await recordFinalDiscount.mutateAsync({
          orderItemId,
          amount: parseFloat(discountAmount),
          note: discountNote || undefined,
        });
      } else {
        await recordManualPayment.mutateAsync({
          orderItemId,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          note: paymentNote || undefined,
        });
      }
      handleOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const isSubmitDisabled =
    isPending ||
    (mode === "payment"
      ? !paymentAmount || parseFloat(paymentAmount) <= 0
      : !discountAmount ||
        parseFloat(discountAmount) <= 0 ||
        parseFloat(discountAmount) > remainingAmount);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Enregistrer</DialogTitle>
          <DialogDescription>
            Solde restant à encaisser :{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(remainingAmount)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("payment")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                mode === "payment"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-input bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <PlusIcon className="h-4 w-4" />
              Paiement reçu
            </button>
            <button
              type="button"
              onClick={() => setMode("discount")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                mode === "discount"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-input bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <PercentIcon2 className="h-4 w-4" />
              Réduction
            </button>
          </div>

          {/* Payment fields */}
          {mode === "payment" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="pd-paymentAmount">Montant encaissé</Label>
                <div className="relative">
                  <EuroSignIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pd-paymentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                    autoFocus
                    disabled={isPending}
                  />
                </div>
                {paymentAmount && parseFloat(paymentAmount) > remainingAmount && (
                  <div className="flex items-start gap-2 p-2.5 bg-orange-50 border border-orange-200 rounded-md">
                    <AlertTriangleIcon className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-orange-900">
                      Montant supérieur au solde restant — vous pouvez tout de même enregistrer.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pd-paymentMethod">Mode de paiement</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                  disabled={isPending}
                >
                  <SelectTrigger id="pd-paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Espèces</SelectItem>
                    <SelectItem value="CARD">Carte Bancaire</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
                    <SelectItem value="CHECK">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pd-paymentNote">Note (optionnel)</Label>
                <Textarea
                  id="pd-paymentNote"
                  value={paymentNote}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPaymentNote(e.target.value)}
                  placeholder="Ex: Réglé en espèces le jour du stage"
                  rows={2}
                  disabled={isPending}
                />
              </div>
            </div>
          )}

          {/* Discount fields */}
          {mode === "discount" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="pd-discountAmount">Montant de la réduction</Label>
                <div className="relative">
                  <EuroSignIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pd-discountAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={remainingAmount}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                    autoFocus
                    disabled={isPending}
                  />
                </div>
                {discountAmount && parseFloat(discountAmount) > remainingAmount ? (
                  <p className="text-xs text-destructive">
                    La réduction ne peut pas dépasser le solde restant ({formatCurrency(remainingAmount)})
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Maximum : {formatCurrency(remainingAmount)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pd-discountNote">Motif (optionnel)</Label>
                <Textarea
                  id="pd-discountNote"
                  value={discountNote}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiscountNote(e.target.value)}
                  placeholder="Ex: Journée annulée pour cause météo"
                  rows={2}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            {isPending ? "Enregistrement..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
