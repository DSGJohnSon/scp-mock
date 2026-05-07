"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDaysIcon, UserIcon, ClockIcon, PhoneIcon, MailIcon, CheckCircleIcon, EuroSignIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useConfirmFinalPayment } from "@/features/orders/api/use-confirm-final-payment";
import { formatCurrencyPrecise as formatCurrency } from "@/lib/formatting";
import { useReservationsData } from "@/features/reservations/hooks/use-reservations-data";

const STATUS_LABELS: Record<string, string> = {
  PAID: "Payé",
  PARTIALLY_PAID: "Acompte payé",
  FULLY_PAID: "Entièrement payé",
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
};

function getBadgeVariant(status: string) {
  switch (status) {
    case "PAID":
    case "FULLY_PAID":
      return "default" as const;
    case "PARTIALLY_PAID":
    case "CONFIRMED":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function ReservationsView() {
  const {
    reservationsData,
    todayData,
    loading,
    headerLabel,
    handlePreviousMonth,
    handleNextMonth,
    refreshAll,
  } = useReservationsData();

  const [activeTab, setActiveTab] = useState("today");
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState("");

  const confirmFinalPayment = useConfirmFinalPayment();

  const handleConfirmPayment = async (orderItemId: string) => {
    try {
      await confirmFinalPayment.mutateAsync({ orderItemId, note: paymentNote || undefined });
      setConfirmingPayment(null);
      setPaymentNote("");
      refreshAll();
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  if (loading && !reservationsData && !todayData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Réservations</h1>
          <p className="text-muted-foreground">Gestion des réservations de stages</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Aujourd&apos;hui</TabsTrigger>
          <TabsTrigger value="monthly">Vue mensuelle</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayData && (
            <>
              <div className="grid gap-4 md:grid-cols-1">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Stages aujourd&apos;hui</CardTitle>
                    <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayData.stageBookings.length}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Stages du jour</CardTitle>
                  <CardDescription>
                    {format(new Date(todayData.date), "EEEE d MMMM yyyy", { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayData.stageBookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun stage prévu aujourd&apos;hui
                    </p>
                  ) : (
                    todayData.stageBookings.map((booking) => {
                      const hasRemainingAmount = booking.orderItem.remainingAmount && booking.orderItem.remainingAmount > 0;
                      const depositPaid = booking.orderItem.depositAmount || 0;
                      const remaining = booking.orderItem.remainingAmount || 0;

                      return (
                        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(booking.orderItem.order.status)}>
                                {STATUS_LABELS[booking.orderItem.order.status] ?? booking.orderItem.order.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{booking.orderItem.order.orderNumber}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(booking.orderItem.totalPrice)}
                              </div>
                              {hasRemainingAmount && (
                                <div className="text-xs text-muted-foreground">
                                  Acompte: {formatCurrency(depositPaid)}
                                </div>
                              )}
                            </div>
                          </div>

                          {hasRemainingAmount && !booking.orderItem.isFullyPaid && (
                            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <EuroSignIcon className="h-4 w-4 text-orange-600" />
                                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                    Reste à payer
                                  </span>
                                </div>
                                <span className="text-lg font-bold text-orange-600">
                                  {formatCurrency(remaining)}
                                </span>
                              </div>
                              <Dialog
                                open={confirmingPayment === booking.orderItem.id}
                                onOpenChange={(open) => !open && setConfirmingPayment(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setConfirmingPayment(booking.orderItem.id)}
                                  >
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    Confirmer le paiement final
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmer le paiement final</DialogTitle>
                                    <DialogDescription>
                                      Confirmez que le client a payé le solde de {formatCurrency(remaining)} en physique.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="note">Note (optionnel)</Label>
                                      <Input
                                        id="note"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        placeholder="Ex: Payé en espèces"
                                        disabled={confirmFinalPayment.isPending}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => { setConfirmingPayment(null); setPaymentNote(""); }}
                                        disabled={confirmFinalPayment.isPending}
                                        className="flex-1"
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        onClick={() => handleConfirmPayment(booking.orderItem.id)}
                                        disabled={confirmFinalPayment.isPending}
                                        className="flex-1"
                                      >
                                        {confirmFinalPayment.isPending ? "Confirmation..." : "Confirmer"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.customer.firstName} {booking.customer.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MailIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.phone}</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Durée: {booking.stage.duration} jours</span>
                            </div>
                            <div className="text-sm">
                              <strong>Type:</strong> {booking.stage.type}
                            </div>
                            {booking.stage.moniteurs.length > 0 && (
                              <div className="text-sm">
                                <strong>Moniteurs:</strong>{" "}
                                {booking.stage.moniteurs.map(m => m.moniteur.name).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handlePreviousMonth}>
              Mois précédent
            </Button>
            <h2 className="text-xl font-semibold capitalize">{headerLabel}</h2>
            <Button variant="outline" onClick={handleNextMonth}>
              Mois suivant
            </Button>
          </div>

          {reservationsData && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stages</CardTitle>
                    <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reservationsData.stageBookings.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clients uniques</CardTitle>
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set(reservationsData.stageBookings.map(b => b.customer.id)).size}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Stages du mois</CardTitle>
                  <CardDescription>{reservationsData.stageBookings.length} réservation(s)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {reservationsData.stageBookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Aucun stage ce mois-ci</p>
                  ) : (
                    reservationsData.stageBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getBadgeVariant(booking.orderItem.order.status)}>
                              {STATUS_LABELS[booking.orderItem.order.status] ?? booking.orderItem.order.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              #{booking.orderItem.order.orderNumber}
                            </span>
                          </div>
                          <span className="font-medium">
                            {formatCurrency(booking.orderItem.order.totalAmount)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {format(new Date(booking.stage.startDate), "dd/MM/yyyy", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {booking.customer.firstName} {booking.customer.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MailIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{booking.customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{booking.customer.phone}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Type:</strong> {booking.stage.type} - {booking.stage.duration} jours
                          </div>
                          {booking.stage.moniteurs.length > 0 && (
                            <div className="text-sm">
                              <strong>Moniteurs:</strong>{" "}
                              {booking.stage.moniteurs.map(m => m.moniteur.name).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
