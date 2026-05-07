"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function Countdown({ initialSeconds, start }: { initialSeconds: number; start: boolean }) {
  const [s, setS] = useState(initialSeconds);
  useEffect(() => {
    if (!start) return;
    setS(initialSeconds);
    const id = setInterval(
      () => setS((p) => p <= 1 ? (clearInterval(id), 0) : p - 1),
      1000,
    );
    return () => clearInterval(id);
  }, [start, initialSeconds]);
  return (
    <span className="text-sm font-medium">
      Temps restant :{" "}
      {Math.floor(s / 60).toString().padStart(2, "0")}
      :{(s % 60).toString().padStart(2, "0")}
    </span>
  );
}

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueShopping: () => void;
  onGoToCheckout: () => void;
}

export function SuccessDialog({
  open,
  onOpenChange,
  onContinueShopping,
  onGoToCheckout,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Place temporairement bloquée.
          </DialogTitle>
          <DialogDescription className="text-center text-base space-y-2">
            <p className="font-semibold text-slate-800">
              Votre place est bloquée pendant 1h00
            </p>
            <p className="text-sm">
              Finalisez votre paiement dans l&apos;heure pour confirmer votre
              réservation.
            </p>
            <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg mt-3">
              <Clock className="w-4 h-4" />
              <Countdown initialSeconds={3600} start={open} />
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={onContinueShopping} className="w-full gap-2" size="lg">
            <ArrowLeft className="w-4 h-4" /> Je continue mes achats
          </Button>
          <Button onClick={onGoToCheckout} variant="outline" className="w-full gap-2" size="lg">
            <ShoppingCart className="w-4 h-4" /> Voir mon panier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
