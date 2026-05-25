"use client";

import { useState } from "react";
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
import { useCancelReservation } from "@/features/reservations/api/use-cancel-reservation";

const CONFIRM_WORD = "ANNULER";

interface ReservationCancelDialogProps {
  reservationId: string;
  stagiaireName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

export function ReservationCancelDialog({
  reservationId,
  stagiaireName,
  open,
  onOpenChange,
  onCancelled,
}: ReservationCancelDialogProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const cancelReservation = useCancelReservation();

  const isConfirmed = confirmInput === CONFIRM_WORD;

  const handleConfirm = () => {
    if (!isConfirmed) return;
    cancelReservation.mutate(
      { id: reservationId },
      {
        onSuccess: (response: unknown) => {
          const r = response as { success: boolean };
          if (r.success) {
            onOpenChange(false);
            setConfirmInput("");
            onCancelled();
          }
        },
      },
    );
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setConfirmInput("");
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Annuler cette réservation ?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 mt-2">
              <p className="text-sm text-muted-foreground">
                Vous êtes sur le point d&apos;annuler la réservation de{" "}
                <span className="font-semibold text-foreground">{stagiaireName}</span>.
              </p>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                <p className="text-sm font-semibold text-destructive">
                  ⚠ Cette action est irréversible
                </p>
                <ul className="text-sm text-muted-foreground space-y-0.5 list-disc list-inside">
                  <li>La réservation sera marquée comme annulée</li>
                  <li>La place sera libérée sur le stage</li>
                  <li>Aucun remboursement n&apos;est effectué automatiquement</li>
                </ul>
              </div>
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="cancel-confirm" className="text-sm text-foreground">
                  Tapez{" "}
                  <span className="font-mono font-bold">{CONFIRM_WORD}</span>{" "}
                  pour confirmer
                </Label>
                <Input
                  id="cancel-confirm"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={CONFIRM_WORD}
                  className="font-mono"
                  disabled={cancelReservation.isPending}
                />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={cancelReservation.isPending}
          >
            Retour
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || cancelReservation.isPending}
          >
            {cancelReservation.isPending ? "Annulation…" : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
