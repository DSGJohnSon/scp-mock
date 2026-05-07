"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { EditIcon, TrashIcon, SaveIcon2, XIcon, TagIcon, XCircleIcon } from "@/lib/icons";
import { useGetMoniteursAndAdmins } from "@/features/users/api/use-get-moniteurs-and-admins";
import { useGetStageById } from "../api/use-get-stage";
import { useUpdateStage } from "../api/use-update-stages";
import { useDeleteStage } from "../api/use-delete-stages";
import { useApplyStagePromotion } from "../api/use-apply-stage-promotion";
import { useCancelStagePromotion } from "../api/use-cancel-stage-promotion";
import { toast } from "sonner";
import { StageInfoTab } from "./stage-info-tab";
import { StageMoniteursTab } from "./stage-moniteurs-tab";
import { StageParticipantsTab } from "./stage-participants-tab";
import {
  BookingWithStagiaire,
  EditedStageState,
  StageWithDetails,
  TypeConfig,
} from "./stage-types";

export type { StageWithDetails, EditedStageState, TypeConfig, BookingWithStagiaire };

// ─── Config couleurs ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, TypeConfig> = {
  INITIATION:  { hex: "#38bdf8", label: "Initiation",  badgeCls: "bg-sky-100 text-sky-800 border-sky-200" },
  PROGRESSION: { hex: "#3b82f6", label: "Progression", badgeCls: "bg-blue-100 text-blue-800 border-blue-200" },
  AUTONOMIE:   { hex: "#1e40af", label: "Autonomie",   badgeCls: "bg-blue-100 text-blue-900 border-blue-300" },
  DOUBLE:      { hex: "#8b5cf6", label: "Double",      badgeCls: "bg-violet-100 text-violet-800 border-violet-200" },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface StageDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: StageWithDetails | null;
  role?: string;
}

// ─── Composant orchestrateur ──────────────────────────────────────────────────

export function StageDetailsSheet({
  open,
  onOpenChange,
  stage,
  role,
}: StageDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [showCancelPromotionDialog, setShowCancelPromotionDialog] = useState(false);
  const [promotionForm, setPromotionForm] = useState({ newPrice: "", endDate: "", reason: "" });
  const [editedStage, setEditedStage] = useState<EditedStageState | null>(null);

  const { data: moniteurs } = useGetMoniteursAndAdmins();
  const { data: fullStageData, isLoading: isLoadingDetails } = useGetStageById(stage?.id || "");
  const displayStage = (fullStageData as StageWithDetails | null) || stage;

  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const applyPromotion = useApplyStagePromotion();
  const cancelPromotion = useCancelStagePromotion();

  if (!displayStage) return null;

  const bookings: BookingWithStagiaire[] = (fullStageData?.bookings || []) as BookingWithStagiaire[];
  const currentBookingsCount =
    fullStageData?.bookings?.length ?? displayStage.confirmedBookings ?? 0;
  const placesRestantes = displayStage.places - currentBookingsCount;
  const hasActivePromotion = !!displayStage.promotionOriginalPrice;
  const cfg: TypeConfig = TYPE_CONFIG[displayStage.type] ?? {
    hex: "#94a3b8",
    label: displayStage.type,
    badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const endDate = addDays(new Date(displayStage.startDate), displayStage.duration - 1);
  const discountPct =
    hasActivePromotion && displayStage.promotionOriginalPrice
      ? Math.round((1 - displayStage.price / displayStage.promotionOriginalPrice) * 100)
      : 0;
  const currentPlaces = isEditing && editedStage ? editedStage.places : displayStage.places;
  const currentRestantes = isEditing && editedStage
    ? editedStage.places - currentBookingsCount
    : placesRestantes;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = () => {
    setEditedStage({
      places: displayStage.places,
      price: displayStage.price,
      acomptePrice: displayStage.acomptePrice,
      moniteurIds: displayStage.moniteurs.map((m) => m.moniteur.id),
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedStage(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!editedStage) return;
    updateStage.mutate(
      {
        param: { id: displayStage.id },
        json: {
          startDate: new Date(displayStage.startDate).toISOString(),
          duration: displayStage.duration,
          places: editedStage.places,
          price: editedStage.price,
          acomptePrice: editedStage.acomptePrice,
          moniteurIds: editedStage.moniteurIds,
          type: displayStage.type,
        },
      },
      { onSuccess: () => { setIsEditing(false); setEditedStage(null); } }
    );
  };

  const handleIncreasePlaces = () => {
    if (!editedStage) return;
    setEditedStage({ ...editedStage, places: editedStage.places + 1 });
  };

  const handleDecreasePlaces = () => {
    if (!editedStage) return;
    if (editedStage.places <= currentBookingsCount) {
      toast.error(`Impossible de réduire en dessous de ${currentBookingsCount} places`);
      return;
    }
    if (editedStage.places <= 1) {
      toast.error("Le nombre de places doit être supérieur à 0");
      return;
    }
    setEditedStage({ ...editedStage, places: editedStage.places - 1 });
  };

  const handleDelete = () => {
    if (currentBookingsCount > 0) {
      toast.error("Impossible de supprimer un stage avec des réservations");
      return;
    }
    deleteStage.mutate({ id: displayStage.id }, { onSuccess: () => onOpenChange(false) });
  };

  const handleApplyPromotion = () => {
    const newPrice = parseFloat(promotionForm.newPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Le prix promotionnel doit être supérieur à 0");
      return;
    }
    if (newPrice >= displayStage.price && !displayStage.promotionOriginalPrice) {
      toast.error("Le prix promotionnel doit être inférieur au prix actuel");
      return;
    }
    applyPromotion.mutate(
      {
        param: { id: displayStage.id },
        json: {
          newPrice,
          endDate: promotionForm.endDate || undefined,
          reason: promotionForm.reason || undefined,
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            setShowPromotionDialog(false);
            setPromotionForm({ newPrice: "", endDate: "", reason: "" });
          }
        },
      }
    );
  };

  const handleCancelPromotion = () => {
    cancelPromotion.mutate(
      { id: displayStage.id },
      { onSuccess: () => setShowCancelPromotionDialog(false) }
    );
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={onOpenChange} title={`Stage ${cfg.label}`}>
        {/* En-tête */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: cfg.hex }}
              />
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{cfg.label}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {format(new Date(displayStage.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                  {" → "}
                  {format(endDate, "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
              <Badge className={`${cfg.badgeCls} border flex-shrink-0`}>{cfg.label}</Badge>
            </div>

            {role === "ADMIN" && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!isEditing ? (
                  <>
                    {hasActivePromotion ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 gap-1 text-xs"
                        onClick={() => setShowCancelPromotionDialog(true)}
                      >
                        <XCircleIcon className="h-3.5 w-3.5" />
                        Annuler promo
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 gap-1 text-xs"
                        onClick={() => setShowPromotionDialog(true)}
                      >
                        <TagIcon className="h-3.5 w-3.5" />
                        Promo
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <EditIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentBookingsCount > 0}
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      disabled={updateStage.isPending}
                      className="text-green-600 hover:text-green-700 gap-1 text-xs"
                    >
                      <SaveIcon2 className="h-3.5 w-3.5" />
                      Sauvegarder
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-5">
          <Tabs defaultValue="info">
            <TabsList className="mb-5">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="participants">
                Participants ({currentBookingsCount})
              </TabsTrigger>
              <TabsTrigger value="moniteurs">Moniteurs</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <StageInfoTab
                displayStage={displayStage}
                isEditing={isEditing}
                editedStage={editedStage}
                currentBookingsCount={currentBookingsCount}
                currentPlaces={currentPlaces}
                currentRestantes={currentRestantes}
                hasActivePromotion={hasActivePromotion}
                discountPct={discountPct}
                cfg={cfg}
                endDate={endDate}
                onIncreasePlaces={handleIncreasePlaces}
                onDecreasePlaces={handleDecreasePlaces}
                onEditedStageChange={setEditedStage}
              />
            </TabsContent>

            <TabsContent value="participants">
              <StageParticipantsTab
                bookings={bookings}
                currentBookingsCount={currentBookingsCount}
                currentPlaces={currentPlaces}
                isLoadingDetails={isLoadingDetails}
              />
            </TabsContent>

            <TabsContent value="moniteurs">
              <StageMoniteursTab
                displayStage={displayStage}
                isEditing={isEditing}
                editedStage={editedStage}
                moniteurs={moniteurs}
                onMoniteursChange={(ids) =>
                  setEditedStage(editedStage ? { ...editedStage, moniteurIds: ids } : null)
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveModal>

      {/* Confirmation suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le stage</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce stage ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => { handleDelete(); setShowDeleteDialog(false); }}
              disabled={deleteStage.isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appliquer une promotion */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appliquer une promotion</DialogTitle>
            <DialogDescription>
              Prix actuel : <strong>{displayStage.price}€</strong>. Définissez le nouveau prix promotionnel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="promo-price">Nouveau prix (€) *</Label>
              <Input
                id="promo-price"
                type="number"
                placeholder={`Ex: ${Math.round(displayStage.price * 0.9)}`}
                value={promotionForm.newPrice}
                onChange={(e) => setPromotionForm({ ...promotionForm, newPrice: e.target.value })}
                min="1"
                step="1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promo-end">Date de fin (optionnel)</Label>
              <Input
                id="promo-end"
                type="date"
                value={promotionForm.endDate}
                onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promo-reason">Raison (optionnel)</Label>
              <Input
                id="promo-reason"
                type="text"
                placeholder="Ex: Promo printemps"
                value={promotionForm.reason}
                onChange={(e) => setPromotionForm({ ...promotionForm, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPromotionDialog(false);
                setPromotionForm({ newPrice: "", endDate: "", reason: "" });
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleApplyPromotion}
              disabled={applyPromotion.isPending || !promotionForm.newPrice}
            >
              Appliquer la promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Annuler la promotion */}
      <Dialog open={showCancelPromotionDialog} onOpenChange={setShowCancelPromotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la promotion</DialogTitle>
            <DialogDescription>
              Le prix reviendra à <strong>{displayStage.promotionOriginalPrice}€</strong>. Êtes-vous sûr ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelPromotionDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelPromotion}
              disabled={cancelPromotion.isPending}
            >
              Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
