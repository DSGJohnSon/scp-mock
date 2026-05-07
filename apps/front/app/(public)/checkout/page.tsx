"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Trash2 } from "lucide-react";
import { CartSummary } from "@/components/checkout/CartSummary";
import { CustomerForm, type CheckoutFormData } from "@/components/checkout/CustomerForm";
import { LoadingOverlay } from "@/components/checkout/LoadingOverlay";
import ResponsiveModal from "@/components/responsive-modal";
import { useCartItems } from "@/hooks/useCartItems";
import { usePromoCode } from "@/hooks/usePromoCode";
import { getItemTitle, getItemPrice, getStageDeposit, getStageRemaining } from "@/lib/pricing";

export default function CheckoutPage() {
  const {
    cartItems,
    loading,
    isUpdating,
    loadCartItems,
    handleDeleteClick,
    confirmRemoveItem,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    itemToDelete,
    expandedDetails,
    toggleExpanded,
  } = useCartItems();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [step, setStep] = useState<"cart" | "customer-info">("cart");
  const {
    promoCodeInput,
    setPromoCodeInput,
    isApplyingPromo,
    appliedPromo,
    applyPromoCode,
    clearPromoCode,
  } = usePromoCode(cartItems);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>();
  const { toast } = useToast();

  const calculateTotals = () => {
    let depositTotal = 0;
    let remainingTotal = 0;
    cartItems.forEach((item) => {
      if (item.participantData?.usedGiftVoucherCode) return;
      depositTotal += getStageDeposit(item.stage);
      remainingTotal += getStageRemaining(item.stage);
    });
    return { depositTotal, remainingTotal };
  };

  const onSubmit = async (data: CheckoutFormData) => {
    console.log("[CHECKOUT] 🛒 Creating order", {
      timestamp: new Date().toISOString(),
      customerEmail: data.email,
      cartItemsCount: cartItems.length,
    });

    setIsCreatingOrder(true);

    try {
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            customerEmail: data.email,
            customerData: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              address: data.address,
              postalCode: data.postalCode,
              city: data.city,
              country: data.country,
            },
            ...(appliedPromo ? { promoCodeId: appliedPromo.id } : {}),
          }),
        },
      );

      const result = await response.json();

      console.log("[CHECKOUT] 📥 Order creation response", {
        success: result.success,
        orderNumber: result.data?.order?.orderNumber,
        requiresPayment: result.data?.requiresPayment,
      });

      if (result.success) {
        const requiresPayment =
          result.data.requiresPayment !== false &&
          result.data.paymentIntent !== null;

        if (!requiresPayment) {
          toast({
            title: "Réservation confirmée ! 🎉",
            description: `Votre réservation ${result.data.order.orderNumber} a été validée`,
          });
          window.location.href = `/checkout/success?order=${result.data.order.id}`;
        } else {
          const clientSecret = result.data.paymentIntent.clientSecret;
          toast({
            title: "Commande créée !",
            description: `Commande ${result.data.order.orderNumber} créée avec succès`,
          });
          window.location.href = `/checkout/payment?order=${result.data.order.id}&client_secret=${clientSecret}`;
        }
      } else {
        toast({
          title: "Erreur",
          description:
            result.message || "Erreur lors de la création de la commande",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur création commande:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la commande",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Chargement de votre commande
          </h2>
          <p className="text-gray-500">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Votre panier est vide
          </h1>
          <p className="text-gray-600 mb-8">
            Découvrez nos expériences uniques en parapente
          </p>
          <Button
            onClick={() => (window.location.href = "/reserver")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Explorer les activités
          </Button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de progression */}
      <div className="bg-white border-b shadow-sm pt-16">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`flex items-center gap-2 ${step === "cart" ? "text-blue-600" : "text-emerald-600"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "cart" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}`}
              >
                {step === "customer-info" ? "✓" : "1"}
              </div>
              <span className="text-sm font-medium hidden sm:block">Panier</span>
            </div>
            <div
              className={`h-px w-10 ${step === "customer-info" ? "bg-blue-400" : "bg-gray-300"}`}
            />
            <div
              className={`flex items-center gap-2 ${step === "customer-info" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "customer-info" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
              >
                2
              </div>
              <span className="text-sm font-medium hidden sm:block">
                Informations
              </span>
            </div>
            <div className="h-px w-10 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                3
              </div>
              <span className="text-sm font-medium hidden sm:block">
                Paiement
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {step === "cart" ? (
          <CartSummary
            cartItems={cartItems}
            expandedDetails={expandedDetails}
            onToggleExpanded={toggleExpanded}
            onDeleteClick={handleDeleteClick}
            onReloadCart={() => loadCartItems(true)}
            appliedPromo={appliedPromo}
            promoCodeInput={promoCodeInput}
            onPromoCodeChange={setPromoCodeInput}
            onApplyPromo={() => applyPromoCode(totals.depositTotal)}
            isApplyingPromo={isApplyingPromo}
            onClearPromo={clearPromoCode}
            onContinue={() => setStep("customer-info")}
            totals={totals}
          />
        ) : (
          <CustomerForm
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            isCreatingOrder={isCreatingOrder}
            cartItems={cartItems}
            totals={totals}
            appliedPromo={appliedPromo}
            onBack={() => setStep("cart")}
          />
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <ResponsiveModal
        title="Supression d'un article"
        description=""
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        {itemToDelete && (
          <div className="space-y-3">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer cet article de votre panier ?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="font-semibold text-sm text-gray-800">
                {getItemTitle(itemToDelete)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Pour: {itemToDelete.participantData.firstName}{" "}
                {itemToDelete.participantData.lastName}
              </p>
              <p className="text-sm font-bold text-gray-800 mt-2">
                {getItemPrice(itemToDelete)}€
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={confirmRemoveItem}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </ResponsiveModal>

      {isUpdating && (
        <LoadingOverlay message="Mise à jour de votre panier..." />
      )}
    </div>
  );
}
