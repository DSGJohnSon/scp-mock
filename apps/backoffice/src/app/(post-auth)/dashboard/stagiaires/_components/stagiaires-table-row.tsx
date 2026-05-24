"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MailIcon, PhoneIcon, CalendarIcon } from "@/lib/icons";
import { format, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { ContactIdentityCell } from "@/components/shared/contact-identity-cell";
import { AppStagiaire } from "../_types";

interface StagiairesTableRowProps {
  stagiaire: AppStagiaire;
  onDetailClick: (stagiaire: AppStagiaire) => void;
}

export function StagiairesTableRow({
  stagiaire,
  onDetailClick,
}: StagiairesTableRowProps) {
  const age = stagiaire.birthDate
    ? differenceInYears(new Date(), new Date(stagiaire.birthDate))
    : null;

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onDetailClick(stagiaire)}
    >
      <ContactIdentityCell
        firstName={stagiaire.firstName}
        lastName={stagiaire.lastName}
        id={stagiaire.id}
      />

      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            <MailIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[200px]">{stagiaire.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PhoneIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{stagiaire.phone}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-1 text-sm">
          {stagiaire.birthDate && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{age} ans</span>
            </div>
          )}
          <div className="flex gap-3 text-muted-foreground">
            <span>{stagiaire.weight} kg</span>
            <span>{stagiaire.height} cm</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="secondary">
          {stagiaire.stageBookings.length} réservation
          {stagiaire.stageBookings.length !== 1 ? "s" : ""}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {format(new Date(stagiaire.createdAt), "dd/MM/yyyy", {
              locale: fr,
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(stagiaire.createdAt), "HH:mm", { locale: fr })}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
