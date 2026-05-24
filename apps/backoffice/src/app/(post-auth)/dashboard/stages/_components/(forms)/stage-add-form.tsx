"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useGetMoniteursAndAdmins } from "@/features/users/api/use-get-moniteurs-and-admins";
import { MultiSelect } from "@/components/ui/multi-select";
import { StageType } from "@prisma/client";

// ─── Helpers (module-level, pure) ────────────────────────────────────────────

function getDefaultDuration(type: StageType): number {
  return type === StageType.AUTONOMIE ? 14 : 7;
}

function getDefaultPrice(type: StageType): number {
  return type === StageType.AUTONOMIE ? 1200 : 680;
}

function toAcompte(price: number): number {
  return parseFloat((price * 0.4).toFixed(2));
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageAddFormProps {
  selectedDate?: Date | null;
  onSubmit: (stage: {
    startDate: Date;
    duration: number;
    places: number;
    moniteurIds: string[];
    price: number;
    acomptePrice: number;
    type: StageType;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function StageAddForm({ selectedDate, onSubmit, onCancel, isSubmitting = false }: StageAddFormProps) {
  const { data: moniteurs, isLoading: isLoadingMoniteurs } = useGetMoniteursAndAdmins();

  const [formData, setFormData] = useState({
    startDate: selectedDate || new Date(),
    duration: getDefaultDuration(StageType.INITIATION),
    places: 6,
    moniteurIds: [] as string[],
    type: StageType.INITIATION as StageType,
    price: getDefaultPrice(StageType.INITIATION),
    acomptePrice: toAcompte(getDefaultPrice(StageType.INITIATION)),
  });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (selectedDate) setFormData((prev) => ({ ...prev, startDate: selectedDate }));
  }, [selectedDate]);

  const handleTypeChange = (type: StageType) => {
    const price = getDefaultPrice(type);
    setFormData((prev) => ({ ...prev, type, duration: getDefaultDuration(type), price, acomptePrice: toAcompte(price) }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.moniteurIds.length === 0) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Date de début</Label>
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(formData.startDate, "EEEE d MMMM yyyy", { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[60]" align="start">
            <Calendar
              mode="single"
              selected={formData.startDate}
              onSelect={(date) => { if (date) { setFormData((prev) => ({ ...prev, startDate: date })); setShowCalendar(false); } }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Type de stage</Label>
        <Select value={formData.type} onValueChange={(v) => handleTypeChange(v as StageType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={StageType.INITIATION}>Initiation (7 jours)</SelectItem>
            <SelectItem value={StageType.PROGRESSION}>Progression (7 jours)</SelectItem>
            <SelectItem value={StageType.AUTONOMIE}>Autonomie (14 jours)</SelectItem>
            <SelectItem value={StageType.DOUBLE}>Double - Initiation/Progression (7 jours)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Durée (jours)</Label>
        <Input type="number" min="1" max="30" value={formData.duration}
          onChange={(e) => setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) || 1 }))} required />
      </div>

      <div className="space-y-2">
        <Label>Nombre de places</Label>
        <Input type="number" min="1" max="20" value={formData.places}
          onChange={(e) => setFormData((prev) => ({ ...prev, places: parseInt(e.target.value) || 1 }))} required />
      </div>

      <div className="space-y-2">
        <Label>Prix (€)</Label>
        <Input type="number" min="0" step="0.01" value={formData.price}
          onChange={(e) => {
            const price = parseFloat(e.target.value) || 0;
            setFormData((prev) => ({ ...prev, price, acomptePrice: toAcompte(price) }));
          }} required />
        <p className="text-xs text-muted-foreground">
          Prix par défaut : {getDefaultPrice(formData.type).toFixed(2)}€
        </p>
      </div>

      <div className="space-y-2">
        <Label>Acompte (€)</Label>
        <Input type="number" min="0" step="0.01" value={formData.acomptePrice}
          onChange={(e) => setFormData((prev) => ({ ...prev, acomptePrice: parseFloat(e.target.value) || 0 }))} required />
      </div>

      <div className="space-y-2">
        <Label>Moniteurs</Label>
        {isLoadingMoniteurs ? (
          <p className="text-sm text-muted-foreground">Chargement des moniteurs...</p>
        ) : moniteurs && moniteurs.length > 0 ? (
          <MultiSelect
            options={moniteurs.map((m) => ({ value: m.id, label: `${m.name} (${m.role === "ADMIN" ? "Admin" : "Moniteur"})` }))}
            onValueChange={(values) => setFormData((prev) => ({ ...prev, moniteurIds: values }))}
            defaultValue={formData.moniteurIds}
            placeholder="Sélectionner des moniteurs"
            variant="inverted"
            maxCount={3}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Aucun moniteur disponible</p>
        )}
        {formData.moniteurIds.length === 0 && (
          <p className="text-xs text-red-500">Veuillez sélectionner au moins un moniteur</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        )}
        <Button type="submit" className="flex-1" disabled={isSubmitting || formData.moniteurIds.length === 0}>
          {isSubmitting ? "Création en cours..." : "Créer le stage"}
        </Button>
      </div>
    </form>
  );
}
