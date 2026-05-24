"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, UsersIcon, XCircleIcon } from "@/lib/icons";

interface CodesPromoStatsProps {
  total: number;
  actifs: number;
  totalUses: number;
  inactifs: number;
}

export function CodesPromoStats({ total, actifs, totalUses, inactifs }: CodesPromoStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Codes actifs</CardTitle>
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{actifs}</div>
          <p className="text-xs text-muted-foreground">sur {total} au total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisations totales</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUses}</div>
          <p className="text-xs text-muted-foreground">toutes campagnes confondues</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Codes inactifs / expirés</CardTitle>
          <XCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactifs}</div>
          <p className="text-xs text-muted-foreground">à archiver ou réactiver</p>
        </CardContent>
      </Card>
    </div>
  );
}
