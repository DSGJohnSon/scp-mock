"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ParticipantData } from "@/lib/participant-data";
import {
  FileTextIcon,
  UserIcon,
  TagIcon,
  VideoIcon,
  PercentIcon2,
  ExternalLinkIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";

const ITEM_TYPE_LABELS: Record<string, string> = {
  STAGE: "Stage",
  BAPTEME: "Baptême",
  GIFT_VOUCHER: "Bon cadeau",
};

interface PaymentAllocation {
  allocatedAmount: number;
  payment?: { status: string } | null;
}

export interface OrderItemEntry {
  id: string;
  type: string;
  totalPrice: number;
  isFullyPaid: boolean;
  discountAmount?: number | null;
  effectiveDepositAmount?: number | null;
  finalDiscountAmount?: number | null;
  finalDiscountNote?: string | null;
  participantData?: unknown;
  paymentAllocations?: PaymentAllocation[];
  stage?: { type: string; startDate: Date | string } | null;
  bapteme?: { date: Date | string } | null;
  stageBooking?: { id: string; stagiaire?: { firstName: string; lastName: string } | null } | null;
  baptemeBooking?: { id: string; stagiaire?: { firstName: string; lastName: string } | null } | null;
  generatedGiftVoucher?: { code: string } | null;
}

interface OrderItemsSectionProps {
  items: OrderItemEntry[];
}

export function OrderItemsSection({ items }: OrderItemsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileTextIcon className="h-5 w-5" />
          Articles ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const pd = item.participantData as ParticipantData | null;
          const participant =
            item.stageBooking?.stagiaire ?? item.baptemeBooking?.stagiaire;
          const isGiftVoucherUsed = !!pd?.usedGiftVoucherCode;

          const itemAllocations: PaymentAllocation[] = item.paymentAllocations ?? [];
          const itemPaid = itemAllocations
            .filter((a) => a.payment?.status === "SUCCEEDED")
            .reduce((s, a) => s + a.allocatedAmount, 0);

          const itemPromoShare = (item.discountAmount as number) ?? 0;
          const itemFinalDiscount = (item.finalDiscountAmount as number) ?? 0;
          const itemRemaining = item.isFullyPaid
            ? 0
            : Math.max(0, item.totalPrice - itemPaid - itemPromoShare - itemFinalDiscount);

          const bookingId = item.stageBooking?.id ?? item.baptemeBooking?.id;

          return (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              {/* Item header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs shrink-0">
                    {ITEM_TYPE_LABELS[item.type] ?? item.type}
                  </Badge>
                  <span className="font-semibold text-sm">
                    {item.type === "STAGE" && item.stage
                      ? `Stage ${item.stage.type} — ${format(new Date(item.stage.startDate), "dd MMM yyyy", { locale: fr })}`
                      : item.type === "BAPTEME" && item.bapteme
                        ? `Baptême ${pd?.selectedCategory ?? ""} — ${format(new Date(item.bapteme.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}`
                        : item.type === "GIFT_VOUCHER"
                          ? `Bon cadeau ${pd?.voucherProductType === "STAGE" ? `Stage ${pd?.voucherStageCategory ?? ""}` : `Baptême ${pd?.voucherBaptemeCategory ?? ""}`}`
                          : "Article"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-sm">{formatCurrency(item.totalPrice)}</span>
                  {bookingId && (
                    <Link href={`/dashboard/reservations/${bookingId}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Voir la réservation"
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Item body */}
              <div className="px-4 py-3 space-y-2 text-sm">
                {item.type !== "GIFT_VOUCHER" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {participant
                        ? `${participant.firstName} ${participant.lastName}`
                        : pd?.firstName
                          ? `${pd.firstName} ${pd.lastName}`
                          : "—"}
                    </span>
                    {pd?.phone && <span className="text-xs">· {pd.phone}</span>}
                  </div>
                )}

                {item.type === "GIFT_VOUCHER" && (
                  <div className="space-y-1 text-muted-foreground">
                    <p>
                      Acheteur :{" "}
                      <span className="text-foreground font-medium">{pd?.buyerName}</span> (
                      {pd?.buyerEmail})
                    </p>
                    <p>
                      Bénéficiaire :{" "}
                      <span className="text-foreground font-medium">{pd?.recipientName}</span>
                      {pd?.recipientEmail && ` (${pd.recipientEmail})`}
                    </p>
                    {item.generatedGiftVoucher?.code && (
                      <p>
                        Code généré :{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                          {item.generatedGiftVoucher.code}
                        </code>
                      </p>
                    )}
                  </div>
                )}

                {isGiftVoucherUsed && (
                  <div className="flex items-center gap-2 text-green-700">
                    <TagIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Bon cadeau utilisé :{" "}
                      <code className="bg-green-50 px-1.5 py-0.5 rounded text-xs font-mono">
                        {pd?.usedGiftVoucherCode}
                      </code>
                    </span>
                  </div>
                )}

                {pd?.hasVideo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <VideoIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>Option vidéo incluse</span>
                  </div>
                )}

                {(item.discountAmount ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-green-700">
                    <TagIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">
                      Réduction promo (acompte) : -{formatCurrency(item.discountAmount ?? 0)}
                      {item.effectiveDepositAmount != null && (
                        <span className="text-green-600 ml-1">
                          → Acompte effectif : {formatCurrency(item.effectiveDepositAmount)}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {itemFinalDiscount > 0 && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <PercentIcon2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Réduction finale : -{formatCurrency(itemFinalDiscount)}
                      {item.finalDiscountNote && ` (${item.finalDiscountNote})`}
                    </span>
                  </div>
                )}

                <Separator className="my-1" />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Payé :{" "}
                    <span className="text-foreground font-medium">{formatCurrency(itemPaid)}</span>
                  </span>
                  {item.type !== "GIFT_VOUCHER" && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.isFullyPaid || itemRemaining === 0
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {item.isFullyPaid || itemRemaining === 0
                        ? "Soldé"
                        : `Reste : ${formatCurrency(itemRemaining)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
