"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MailIcon, PhoneIcon, MapPinIcon2 } from "@/lib/icons";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { ContactIdentityCell } from "@/components/shared/contact-identity-cell";
import { AppClient } from "../_types";

const OLD_SOFTWARE_DATE = new Date("2025-12-01");

interface ClientsTableRowProps {
  client: AppClient;
  onDetailClick: (client: AppClient) => void;
}

export function ClientsTableRow({ client, onDetailClick }: ClientsTableRowProps) {
  const isOldSoftware = isSameDay(new Date(client.createdAt), OLD_SOFTWARE_DATE);

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onDetailClick(client)}>
      <ContactIdentityCell
        firstName={client.firstName}
        lastName={client.lastName}
        id={client.id}
        badge={
          isOldSoftware ? (
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-800 border-orange-200 text-xs"
            >
              Ancien logiciel
            </Badge>
          ) : undefined
        }
      />

      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            <MailIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[200px]">{client.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PhoneIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{client.phone}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-start gap-2">
          <MapPinIcon2 className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-col text-sm">
            <span>{client.address}</span>
            <span className="text-muted-foreground">
              {client.postalCode} {client.city}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="secondary">
          {client.orders.length} commande{client.orders.length !== 1 ? "s" : ""}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {format(new Date(client.createdAt), "dd/MM/yyyy", { locale: fr })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(client.createdAt), "HH:mm", { locale: fr })}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
