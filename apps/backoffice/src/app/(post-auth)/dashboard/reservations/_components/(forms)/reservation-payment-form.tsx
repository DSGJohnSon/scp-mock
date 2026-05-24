"use client";

import { useState } from "react";
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
import { AlertTriangleIcon, EuroSignIcon } from "@/lib/icons";
import { useRecordManualPayment } from "@/features/reservations/api/use-record-manual-payment";
import { formatCurrencyPrecise } from "@/lib/formatting";

interface ReservationPaymentFormProps {
  orderItemId: string;
  remainingAmount: number;
  onSuccess: () => void;
}

export function ReservationPaymentForm({
  orderItemId,
  remainingAmount,
  onSuccess,
}: ReservationPaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "BANK_TRANSFER" | "CASH" | "CHECK">("CASH");
  const [note, setNote] = useState("");

  const recordPayment = useRecordManualPayment();

  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const exceedsRemaining = isAmountValid && parsedAmount > remainingAmount;

  const handleSubmit = () => {
    if (!isAmountValid) return;
    recordPayment.mutate(
      { orderItemId, amount: parsedAmount, paymentMethod, note: note || undefined },
      { onSuccess },
    );
  };

  return (
    <div className="space-y-4 p-1">
      <p className="text-sm text-muted-foreground">
        Solde restant :{" "}
        <span className="font-semibold text-foreground">
          {formatCurrencyPrecise(remainingAmount)}
        </span>
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="pf-amount">Montant encaissé</Label>
        <div className="relative">
          <EuroSignIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="pf-amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-9"
            autoFocus
            disabled={recordPayment.isPending}
          />
        </div>
        {exceedsRemaining && (
          <div className="flex items-start gap-2 p-2.5 bg-orange-50 border border-orange-200 rounded-md">
            <AlertTriangleIcon className="size-4 text-orange-600 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-900">
              Montant supérieur au solde restant — vous pouvez tout de même enregistrer.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pf-method">Mode de paiement</Label>
        <Select
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
          disabled={recordPayment.isPending}
        >
          <SelectTrigger id="pf-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Espèces</SelectItem>
            <SelectItem value="CARD">Carte bancaire</SelectItem>
            <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
            <SelectItem value="CHECK">Chèque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pf-note">Note (optionnel)</Label>
        <Textarea
          id="pf-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex : Réglé le jour du stage"
          rows={2}
          disabled={recordPayment.isPending}
        />
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!isAmountValid || recordPayment.isPending}
      >
        {recordPayment.isPending ? "Enregistrement…" : "Confirmer le paiement"}
      </Button>
    </div>
  );
}
