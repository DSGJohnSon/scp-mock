"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditIcon, TrashIcon, SaveIcon2, XIcon, TagIcon, XCircleIcon, PlusIcon, MinusIcon } from "@/lib/icons";
import { useGetMoniteursAndAdmins } from "@/features/users/api/use-get-moniteurs-and-admins";
import { useGetStageById } from "@/features/stages/api/use-get-stage-by-id";
import { useDeleteStage } from "@/features/stages/api/use-delete-stage";
import { useStageEditor } from "../../_hooks/use-stage-editor";
import { useStagePromotion } from "../../_hooks/use-stage-promotion";
import { BookingWithStagiaire, StageWithDetails, TypeConfig } from "../../_types";
import { StageParticipantsTab } from "./stage-participants-tab";
import { StageMoniteursTab } from "./stage-moniteurs-tab";

// ─── Config couleurs ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, TypeConfig> = {
  INITIATION:  { hex: "#38bdf8", label: "Initiation",  badgeCls: "bg-sky-100 text-sky-800 border-sky-200" },
  PROGRESSION: { hex: "#3b82f6", label: "Progression", badgeCls: "bg-blue-100 text-blue-800 border-blue-200" },
  AUTONOMIE:   { hex: "#1e40af", label: "Autonomie",   badgeCls: "bg-blue-100 text-blue-900 border-blue-300" },
  DOUBLE:      { hex: "#8b5cf6", label: "Double",      badgeCls: "bg-violet-100 text-violet-800 border-violet-200" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveDialog = "delete" | "promotion" | "cancelPromotion" | null;

interface StageDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: StageWithDetails | null;
  role?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function StageDetailsSheet({ open, onOpenChange, stage, role }: StageDetailsSheetProps) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const { data: moniteurs } = useGetMoniteursAndAdmins();
  const { data: fullStageData, isLoading: isLoadingDetails } = useGetStageById(stage?.id ?? "", open);
  const deleteStage = useDeleteStage();

  const displayStage = (fullStageData as StageWithDetails | null) ?? stage;
  const bookingsCount = fullStageData?.bookings?.length ?? stage?.confirmedBookings ?? 0;

  const editor = useStageEditor(displayStage, bookingsCount);
  const promotion = useStagePromotion(displayStage);

  if (!displayStage) return null;

  const bookings = (fullStageData?.bookings ?? []) as BookingWithStagiaire[];
  const placesRestantes = displayStage.places - bookingsCount;
  const hasPromo = !!displayStage.promotionOriginalPrice;
  const cfg: TypeConfig = TYPE_CONFIG[displayStage.type] ?? {
    hex: "#94a3b8", label: displayStage.type, badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const endDate = addDays(new Date(displayStage.startDate), displayStage.duration - 1);
  const discountPct = hasPromo && displayStage.promotionOriginalPrice
    ? Math.round((1 - displayStage.price / displayStage.promotionOriginalPrice) * 100) : 0;

  const activePlaces = editor.isEditing && editor.editedStage ? editor.editedStage.places : displayStage.places;
  const activePrice  = editor.isEditing && editor.editedStage ? editor.editedStage.price  : displayStage.price;

  const fillPct = Math.min(100, (bookingsCount / activePlaces) * 100);
  const fillColor = placesRestantes <= 2 ? "#dc2626" : cfg.hex;

  const handleDelete = () => {
    if (bookingsCount > 0) { toast.error("Impossible de supprimer un stage avec des réservations"); return; }
    deleteStage.mutate({ id: displayStage.id }, { onSuccess: () => { setActiveDialog(null); onOpenChange(false); } });
  };

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={onOpenChange} title={`Stage ${cfg.label}`}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 space-y-3">

          {/* Type + dates */}
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: cfg.hex }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${cfg.badgeCls} border text-xs`}>{cfg.label}</Badge>
                <span className="text-sm text-slate-500">
                  {format(new Date(displayStage.startDate), "d MMM yyyy", { locale: fr })}
                  {" → "}
                  {format(endDate, "d MMM yyyy", { locale: fr })}
                  <span className="ml-1 text-slate-400">· {displayStage.duration}j</span>
                </span>
              </div>
            </div>
          </div>

          {/* Capacité + prix */}
          {editor.isEditing && editor.editedStage ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={editor.decreasePlaces}
                  disabled={editor.editedStage.places <= bookingsCount} className="h-7 w-7 p-0">
                  <MinusIcon className="h-3.5 w-3.5" />
                </Button>
                <span className="w-7 text-center font-semibold">{editor.editedStage.places}</span>
                <Button variant="outline" size="sm" onClick={editor.increasePlaces} className="h-7 w-7 p-0">
                  <PlusIcon className="h-3.5 w-3.5" />
                </Button>
                <span className="text-slate-500 text-xs">places</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-xs">Prix</span>
                <Input type="number" value={editor.editedStage.price}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    editor.setEditedStage({ ...editor.editedStage!, price, acomptePrice: Math.round(price * 0.4 * 100) / 100 });
                  }}
                  className="w-20 h-7 text-right" min="0" step="0.01" />
                <span className="text-slate-500 text-xs">€</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-xs">Acompte</span>
                <Input type="number" value={editor.editedStage.acomptePrice}
                  onChange={(e) => editor.setEditedStage({ ...editor.editedStage!, acomptePrice: parseFloat(e.target.value) || 0 })}
                  className="w-20 h-7 text-right" min="0" step="0.01" />
                <span className="text-slate-500 text-xs">€</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  <span className={`font-semibold ${placesRestantes <= 2 ? "text-red-600" : "text-slate-800"}`}>
                    {placesRestantes}
                  </span>
                  <span className="text-slate-400"> / {activePlaces} places restantes</span>
                </span>
                <span className="font-semibold text-slate-800">
                  {hasPromo ? (
                    <>
                      <span className="text-red-600">{activePrice}€</span>
                      {" "}
                      <span className="line-through text-slate-400 text-xs font-normal">
                        {displayStage.promotionOriginalPrice}€
                      </span>
                      {" "}
                      <Badge className="bg-red-100 text-red-700 text-[10px] px-1 py-0 border-0">-{discountPct}%</Badge>
                    </>
                  ) : (
                    <>{activePrice}€</>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, backgroundColor: fillColor }} />
              </div>
            </div>
          )}

          {/* Actions admin */}
          {role === "ADMIN" && (
            <div className="flex items-center gap-1.5 justify-end">
              {editor.isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={editor.save} disabled={editor.isSaving}
                    className="text-green-600 hover:text-green-700 gap-1 text-xs">
                    <SaveIcon2 className="h-3.5 w-3.5" /> Sauvegarder
                  </Button>
                  <Button variant="outline" size="sm" onClick={editor.cancelEdit}>
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  {hasPromo ? (
                    <Button variant="outline" size="sm"
                      className="text-orange-600 hover:text-orange-700 gap-1 text-xs"
                      onClick={() => setActiveDialog("cancelPromotion")}>
                      <XCircleIcon className="h-3.5 w-3.5" /> Annuler promo
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm"
                      className="text-green-600 hover:text-green-700 gap-1 text-xs"
                      onClick={() => setActiveDialog("promotion")}>
                      <TagIcon className="h-3.5 w-3.5" /> Promo
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={editor.startEdit}>
                    <EditIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={bookingsCount > 0}
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setActiveDialog("delete")}>
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="px-6 py-5">
          <Tabs defaultValue="participants">
            <TabsList className="mb-5">
              <TabsTrigger value="participants">Participants ({bookingsCount})</TabsTrigger>
              <TabsTrigger value="equipe">Équipe</TabsTrigger>
            </TabsList>
            <TabsContent value="participants">
              <StageParticipantsTab bookings={bookings} currentBookingsCount={bookingsCount}
                currentPlaces={activePlaces} isLoadingDetails={isLoadingDetails} />
            </TabsContent>
            <TabsContent value="equipe">
              <StageMoniteursTab displayStage={displayStage} isEditing={editor.isEditing}
                editedStage={editor.editedStage} moniteurs={moniteurs}
                onMoniteursChange={(ids) =>
                  editor.setEditedStage(editor.editedStage ? { ...editor.editedStage, moniteurIds: ids } : null)
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveModal>

      {/* ── Dialog: supprimer ────────────────────────────────────────────────── */}
      <Dialog open={activeDialog === "delete"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le stage</DialogTitle>
            <DialogDescription>Êtes-vous sûr ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteStage.isPending}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: appliquer promo ──────────────────────────────────────────── */}
      <Dialog open={activeDialog === "promotion"} onOpenChange={(o) => { if (!o) { setActiveDialog(null); promotion.resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appliquer une promotion</DialogTitle>
            <DialogDescription>
              Prix actuel : <strong>{displayStage.price}€</strong>. Définissez le nouveau prix promotionnel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nouveau prix (€) *</Label>
              <Input type="number" placeholder={`Ex: ${Math.round(displayStage.price * 0.9)}`}
                value={promotion.form.newPrice}
                onChange={(e) => promotion.setForm({ ...promotion.form, newPrice: e.target.value })}
                min="1" step="1" />
            </div>
            <div className="space-y-1">
              <Label>Date de fin (optionnel)</Label>
              <Input type="date" value={promotion.form.endDate}
                onChange={(e) => promotion.setForm({ ...promotion.form, endDate: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Raison (optionnel)</Label>
              <Input type="text" placeholder="Ex: Promo printemps" value={promotion.form.reason}
                onChange={(e) => promotion.setForm({ ...promotion.form, reason: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActiveDialog(null); promotion.resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={() => promotion.handleApply(() => setActiveDialog(null))}
              disabled={promotion.isApplying || !promotion.form.newPrice}>
              Appliquer la promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: annuler promo ────────────────────────────────────────────── */}
      <Dialog open={activeDialog === "cancelPromotion"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la promotion</DialogTitle>
            <DialogDescription>
              Le prix reviendra à <strong>{displayStage.promotionOriginalPrice}€</strong>. Êtes-vous sûr ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Annuler</Button>
            <Button variant="destructive"
              onClick={() => promotion.handleCancel(() => setActiveDialog(null))}
              disabled={promotion.isCancelling}>
              Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
