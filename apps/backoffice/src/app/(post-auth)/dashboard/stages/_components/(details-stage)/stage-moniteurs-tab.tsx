"use client";

import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MultiSelect } from "@/components/ui/multi-select";
import { EditedStageState, StageWithDetails } from "../../_types";

interface MoniteurOption {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

interface StageMoniteursTabProps {
  displayStage: StageWithDetails;
  isEditing: boolean;
  editedStage: EditedStageState | null;
  moniteurs: MoniteurOption[] | undefined;
  onMoniteursChange: (ids: string[]) => void;
}

export function StageMoniteursTab({
  displayStage,
  isEditing,
  editedStage,
  moniteurs,
  onMoniteursChange,
}: StageMoniteursTabProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Moniteur{displayStage.moniteurs.length > 1 ? "s" : ""}
      </h3>
      {isEditing && editedStage ? (
        <div className="space-y-2">
          <Label htmlFor="moniteurs" className="text-sm">Sélectionner des moniteurs</Label>
          <MultiSelect
            options={moniteurs?.map((m) => ({
              value: m.id,
              label: `${m.name} (${m.role === "ADMIN" ? "Admin" : "Moniteur"})`,
            })) || []}
            onValueChange={onMoniteursChange}
            defaultValue={editedStage.moniteurIds}
            placeholder="Sélectionner des moniteurs"
            variant="inverted"
            maxCount={3}
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {displayStage.moniteurs.map((md) => (
            <div key={md.moniteur.id} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={md.moniteur.avatarUrl ?? undefined} alt={md.moniteur.name} />
                <AvatarFallback className="text-xs">
                  {md.moniteur.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-slate-800">{md.moniteur.name}</div>
                <div className="text-xs text-slate-500">
                  {md.moniteur.role === "ADMIN" ? "Administrateur" : "Moniteur"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
