"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllStages } from "@/features/stages/actions";
import { useGetAllStagiaires } from "@/features/stagiaires/api/use-get-stagiaires";
import { useCreateReservation } from "@/features/reservations/api/use-create-reservation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationManualCreateFormProps {
  onSuccess: () => void;
}

export function ReservationManualCreateForm({ onSuccess }: ReservationManualCreateFormProps) {
  const [stagiaireId, setStagiaireId] = useState("");
  const [stageId, setStageId] = useState("");
  const [type, setType] = useState<"INITIATION" | "PROGRESSION" | "AUTONOMIE">("INITIATION");

  const { data: stagesResult } = useQuery({
    queryKey: ["stages-list"],
    queryFn: getAllStages,
  });

  const { data: stagiairesResult } = useGetAllStagiaires({ nopaging: true });

  const createReservation = useCreateReservation();

  const stages = (stagesResult?.data ?? []) as Array<{
    id: string;
    startDate: string;
    type: string;
  }>;
  const stagiaires = (stagiairesResult?.stagiaires ?? []) as Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;

  const handleSubmit = () => {
    if (!stagiaireId || !stageId) return;
    createReservation.mutate(
      { stagiaireId, stageId, type },
      { onSuccess: () => { onSuccess(); } },
    );
  };

  return (
    <div className="space-y-4 p-1">
      <div className="space-y-1.5">
        <Label htmlFor="mc-stagiaire">Stagiaire *</Label>
        <Select value={stagiaireId} onValueChange={setStagiaireId}>
          <SelectTrigger id="mc-stagiaire">
            <SelectValue placeholder="Sélectionner un stagiaire…" />
          </SelectTrigger>
          <SelectContent>
            {stagiaires.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mc-stage">Stage *</Label>
        <Select value={stageId} onValueChange={setStageId}>
          <SelectTrigger id="mc-stage">
            <SelectValue placeholder="Sélectionner un stage…" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {format(new Date(s.startDate), "dd/MM/yyyy", { locale: fr })} — {s.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mc-type">Type de stage *</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as "INITIATION" | "PROGRESSION" | "AUTONOMIE")}
        >
          <SelectTrigger id="mc-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INITIATION">Initiation</SelectItem>
            <SelectItem value="PROGRESSION">Progression</SelectItem>
            <SelectItem value="AUTONOMIE">Autonomie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!stagiaireId || !stageId || createReservation.isPending}
      >
        {createReservation.isPending ? "Création…" : "Créer la réservation"}
      </Button>
    </div>
  );
}
