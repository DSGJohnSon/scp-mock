"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon2,
} from "@/lib/icons";

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
}

interface OrderClientCardProps {
  client?: ClientInfo | null;
}

export function OrderClientCard({ client }: OrderClientCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserIcon className="h-5 w-5" />
          Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {client ? (
          <>
            <div className="flex items-start gap-3">
              <UserIcon className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-base">
                  {client.firstName} {client.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm">{client.email}</p>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm">{client.phone}</p>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-3">
                <MapPinIcon2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm">
                  {client.address}, {client.postalCode} {client.city}
                  {client.country && `, ${client.country}`}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun client associé</p>
        )}
      </CardContent>
    </Card>
  );
}
