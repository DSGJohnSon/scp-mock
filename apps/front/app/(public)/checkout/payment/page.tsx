'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StripeProvider } from '@/components/providers/StripeProvider';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderRecap } from '@/components/checkout/OrderRecap';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePaymentOrder } from '@/hooks/usePaymentOrder';

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const clientSecretParam = searchParams.get('client_secret');

  const [clientSecret] = useState<string>(clientSecretParam || '');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  const { order, loading } = usePaymentOrder(orderId, clientSecretParam);

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('[PAYMENT SUCCESS] 🎉', { orderId, paymentIntentId: paymentIntent?.id });
    setPaymentSuccess(true);
    toast({ title: 'Paiement réussi !', description: 'Votre réservation a été confirmée' });
    setTimeout(() => {
      window.location.href = `/checkout/success?order=${orderId}`;
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    toast({ title: 'Erreur de paiement', description: error, variant: 'destructive' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-6">La commande demandée n&apos;existe pas ou a expiré</p>
          <Button onClick={() => (window.location.href = '/')}>Retour à l&apos;accueil</Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold mb-2">Paiement non requis</h1>
          <p className="text-gray-600 mb-6">Cette commande ne nécessite pas de paiement</p>
          <Button onClick={() => (window.location.href = `/checkout/success?order=${orderId}`)}>
            Voir ma confirmation
          </Button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Paiement réussi !</h1>
          <p className="text-gray-500">Redirection vers la confirmation…</p>
        </div>
      </div>
    );
  }

  const todayAmount = (order.depositAmount || (order as any).totalAmount) as number;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de progression — étape 3 active */}
      <div className="bg-white border-b shadow-sm pt-16">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm font-medium hidden sm:block">Panier</span>
            </div>
            <div className="h-px w-10 bg-emerald-400" />
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm font-medium hidden sm:block">Informations</span>
            </div>
            <div className="h-px w-10 bg-blue-400" />
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-sm font-medium hidden sm:block">Paiement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche — Formulaire Stripe (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Paiement sécurisé
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Commande <span className="font-mono font-semibold text-gray-700">{order.orderNumber}</span> — {order.customerEmail}
                </p>
              </div>

              <div className="p-6">
                {clientSecret ? (
                  <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      totalAmount={todayAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                    <p className="text-gray-600 mb-4">Erreur lors de l&apos;initialisation du paiement</p>
                    <Button onClick={() => window.location.reload()}>Réessayer</Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite — Récapitulatif sticky (1/3) */}
          <OrderRecap order={order} todayAmount={todayAmount} />
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement du paiement...</p>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
