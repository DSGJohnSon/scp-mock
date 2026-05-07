"use client";

import { Button } from "@/components/ui/button";
import { useGetStageById } from "@/features/stages/api/use-get-stage";
import { RefreshIcon, SadIcon } from "@/lib/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StageHeaderCard } from "./stage-header-card";
import { StageParticipantsSection } from "./stage-participants-section";

export default function StageDetails({ id }: { id: string }) {
  const { data: stage, isLoading, error } = useGetStageById(id);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshIcon className="h-4 w-4 animate-spin" />
          <span>Chargement des détails du stage...</span>
        </div>
      </div>
    );
  }

  if (error || !stage) {
    return (
      <div className="bg-slate-50 text-slate-800 rounded-lg p-8 flex flex-col items-center justify-center border border-slate-200 gap-4">
        <SadIcon className="h-12 w-12 text-slate-400" />
        <div className="flex flex-col items-center text-center">
          <h3 className="font-semibold text-lg">Aucun stage trouvé</h3>
          <p className="text-slate-600 mb-2">
            Impossible de récupérer les informations du stage.
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Ceci peut être dû à une erreur de connexion avec la base de données.
          </p>
          <Button variant="outline" size="lg" onClick={() => router.refresh()}>
            <RefreshIcon className="h-4 w-4 mr-2" />
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/stages"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        <Button variant="link" className="p-0">
          &larr; Retour à la liste des stages
        </Button>
      </Link>

      <StageHeaderCard
        stage={{
          id: stage.id,
          type: stage.type,
          startDate: stage.startDate,
          duration: stage.duration,
          places: stage.places,
          createdAt: stage.createdAt,
          updatedAt: stage.updatedAt,
          bookingsCount: stage.bookings.length,
        }}
      />

      <StageParticipantsSection bookings={stage.bookings} />
    </div>
  );
}
