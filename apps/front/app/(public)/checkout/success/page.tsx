"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Mail, Phone, Calendar } from "lucide-react";
import { getStageDeposit, getStageRemaining } from "@/lib/pricing";
import { useOrderConfirmation } from "@/hooks/useOrderConfirmation";
import type { OrderItem } from "@/hooks/useOrderConfirmation";
import { SuccessOrderSummary } from "@/components/checkout/SuccessOrderSummary";
import { FuturePaymentsList } from "@/components/checkout/FuturePaymentsList";

function CheckoutSuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const { order, loading } = useOrderConfirmation(orderId);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const calculateTotals = () => {
    let depositTotal = 0;
    let remainingTotal = 0;
    const futurePayments: { amount: number; date: string; description: string; participantName: string }[] = [];

    order?.orderItems?.forEach((item: any) => {
      if (item.participantData?.usedGiftVoucherCode) return;

      if (item.type === "STAGE") {
        const deposit = getStageDeposit(item.stage);
        const remaining = getStageRemaining(item.stage);
        depositTotal += deposit;
        remainingTotal += remaining;
        if (remaining > 0) {
          futurePayments.push({
            amount: remaining,
            date: item.stage?.startDate,
            description: `Solde Stage ${item.stage?.type}`,
            participantName: `${item.participantData?.firstName || ""} ${item.participantData?.lastName || ""}`.trim(),
          });
        }
      } else {
        depositTotal += item.totalPrice;
      }
    });

    const promoDiscount = order?.discountAmount || 0;
    return { depositTotal: Math.max(0, depositTotal - promoDiscount), remainingTotal, futurePayments };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre confirmation...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-4">Impossible de récupérer les détails de votre commande</p>
          <Button onClick={() => (window.location.href = "/")}>Retour à l&apos;accueil</Button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Barre de progression — toutes les étapes complétées */}
      <div className="bg-white border-b shadow-sm pt-16 print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {[{ label: "Panier" }, { label: "Informations" }, { label: "Paiement" }].map(({ label }, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <div className="h-px w-10 bg-emerald-400" />}
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                  <span className="text-sm font-medium hidden sm:block">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 print:px-8 print:py-0 space-y-4">

        {/* Titre d'impression */}
        <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-gray-300">
          <h1 className="text-2xl font-bold text-gray-800">Confirmation de commande</h1>
          <p className="text-gray-600">Commande {order.orderNumber} — {formatDateTime(order.createdAt)}</p>
        </div>

        <SuccessOrderSummary
          order={order}
          totals={totals}
          formatDate={formatDate}
          formatTime={formatTime}
          formatDateTime={formatDateTime}
        />

        <FuturePaymentsList
          payments={totals.futurePayments}
          remainingTotal={totals.remainingTotal}
          formatDate={formatDate}
        />

        {/* Prochaines étapes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 print:hidden">
          <h2 className="font-semibold text-gray-900">Prochaines étapes</h2>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Confirmation par email</p>
              <p className="text-xs text-gray-500">Vous allez recevoir un email de confirmation avec tous les détails</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Tenez-vous prêts</p>
              <p className="text-xs text-gray-500">Enregistrez votre date et heure de vol dans votre agenda</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 print:hidden">
          <h2 className="font-semibold text-gray-900 mb-3">Besoin d&apos;aide ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                <a href="tel:0645913595" className="font-medium text-blue-600 hover:underline">06 45 91 35 95</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <a href="mailto:clementpons5@gmail.com" className="font-medium text-blue-600 hover:underline">
                  clementpons5@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden pb-8">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Download className="w-4 h-4" />
            Imprimer la confirmation
          </Button>
          <Button onClick={() => (window.location.href = "/")}>
            Retour à l&apos;accueil
          </Button>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de votre confirmation...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
