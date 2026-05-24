"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  WeightIcon2,
  RulerIcon2,
  CakeIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface StagiaireInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate: string | null;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface ReservationStagiaireCardProps {
  stagiaire: StagiaireInfo;
  client: ClientInfo | null | undefined;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ReservationStagiaireCard({
  stagiaire,
  client,
}: ReservationStagiaireCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="size-4" />
          Stagiaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          icon={UserIcon}
          label="Nom complet"
          value={`${stagiaire.firstName} ${stagiaire.lastName}`}
        />
        <Separator />
        <InfoRow icon={MailIcon} label="Email" value={stagiaire.email} />
        <InfoRow icon={PhoneIcon} label="Téléphone" value={stagiaire.phone} />
        <Separator />
        <InfoRow icon={WeightIcon2} label="Poids" value={`${stagiaire.weight} kg`} />
        <InfoRow icon={RulerIcon2} label="Taille" value={`${stagiaire.height} cm`} />
        {stagiaire.birthDate && (
          <InfoRow
            icon={CakeIcon}
            label="Date de naissance"
            value={format(new Date(stagiaire.birthDate), "dd MMMM yyyy", { locale: fr })}
          />
        )}

        {client && (
          <>
            <Separator className="my-1" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Client payeur
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {client.firstName} {client.lastName}
                </p>
                <p className="text-muted-foreground">{client.email}</p>
                {client.phone && (
                  <p className="text-muted-foreground">{client.phone}</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
