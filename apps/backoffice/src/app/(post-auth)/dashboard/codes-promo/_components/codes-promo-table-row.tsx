"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  EditIcon,
  EuroSignIcon,
  PercentIcon2,
  TrashIcon,
  XCircleIcon,
} from "@/lib/icons";
import { useDeletePromoCode } from "@/features/promocodes/api/use-delete-promocode";
import { PromoCode } from "../_types";
import { getPromoStatus, isExpired, isMaxedOut } from "../_hooks/use-codes-promo-page";

type ActiveDialog = "delete" | null;

interface CodesPromoTableRowProps {
  promoCode: PromoCode;
  onEdit: (promoCode: PromoCode) => void;
}

const STATUS_ICONS = {
  Actif: CheckCircleIcon,
  Inactif: XCircleIcon,
  Expiré: AlertTriangleIcon,
  Épuisé: AlertTriangleIcon,
} as const;

function getDiscountLabel(promoCode: PromoCode) {
  if (promoCode.discountType === "FIXED") {
    return `-${promoCode.discountValue.toFixed(2)}€`;
  }
  const label = `-${promoCode.discountValue}%`;
  if (promoCode.maxDiscountAmount) {
    return `${label} (max ${promoCode.maxDiscountAmount.toFixed(2)}€)`;
  }
  return label;
}

export function CodesPromoTableRow({ promoCode, onEdit }: CodesPromoTableRowProps) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [copied, setCopied] = useState(false);

  const deletePromoCode = useDeletePromoCode();

  const status = getPromoStatus(promoCode);
  const StatusIcon = STATUS_ICONS[status.label as keyof typeof STATUS_ICONS] ?? XCircleIcon;
  const expired = isExpired(promoCode);
  const maxed = isMaxedOut(promoCode);
  const canDelete = promoCode.currentUses === 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promoCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    deletePromoCode.mutate(
      { id: promoCode.id },
      { onSuccess: () => setActiveDialog(null) },
    );
  };

  return (
    <>
      <TableRow>
        {/* Code */}
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <code className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                {promoCode.code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <CopyIcon className="h-3 w-3" />
                )}
              </Button>
            </div>
            {promoCode.label && (
              <p className="text-xs text-muted-foreground">{promoCode.label}</p>
            )}
            {promoCode.recipientNote && (
              <p className="text-xs text-blue-600 italic">{promoCode.recipientNote}</p>
            )}
          </div>
        </TableCell>

        {/* Réduction */}
        <TableCell>
          <div className="flex items-center gap-1">
            {promoCode.discountType === "PERCENTAGE" ? (
              <PercentIcon2 className="h-3.5 w-3.5 text-purple-500" />
            ) : (
              <EuroSignIcon className="h-3.5 w-3.5 text-blue-500" />
            )}
            <span className="font-medium text-sm">{getDiscountLabel(promoCode)}</span>
          </div>
        </TableCell>

        {/* Règles */}
        <TableCell>
          <div className="space-y-1 text-xs text-muted-foreground">
            {promoCode.minCartAmount ? (
              <div>Min panier : {promoCode.minCartAmount.toFixed(2)}€</div>
            ) : null}
            {promoCode.campaignId ? (
              <Badge variant="outline" className="text-xs">Via campagne SMS</Badge>
            ) : null}
            {!promoCode.minCartAmount && !promoCode.campaignId && (
              <span>—</span>
            )}
          </div>
        </TableCell>

        {/* Utilisations */}
        <TableCell>
          <span className="text-sm font-medium">{promoCode.currentUses}</span>
          {promoCode.maxUses ? (
            <span className="text-sm text-muted-foreground"> / {promoCode.maxUses}</span>
          ) : (
            <span className="text-sm text-muted-foreground"> / ∞</span>
          )}
        </TableCell>

        {/* Expiration */}
        <TableCell>
          {promoCode.expiryDate ? (
            <span className={`text-sm ${expired ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
              {format(promoCode.expiryDate, "dd/MM/yyyy", { locale: fr })}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">∞</span>
          )}
        </TableCell>

        {/* Statut */}
        <TableCell>
          <div className="flex items-center gap-1.5">
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onEdit(promoCode)}>
                  <EditIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Modifier</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!canDelete || deletePromoCode.isPending}
                  onClick={() => setActiveDialog("delete")}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {canDelete
                  ? "Supprimer"
                  : "Impossible (déjà utilisé — désactivez à la place)"}
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>

      {/* Dialog confirmation suppression */}
      <Dialog
        open={activeDialog === "delete"}
        onOpenChange={(o) => !o && setActiveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le code promo</DialogTitle>
            <DialogDescription>
              Supprimer{" "}
              <span className="font-mono font-bold">{promoCode.code}</span> ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePromoCode.isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
