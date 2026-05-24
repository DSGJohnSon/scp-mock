import { UsersGroupIcon, ShoppingCartIcon } from "@/lib/icons";

interface ClientsStatsProps {
  totalCount: number;
  totalOrders: number;
}

export function ClientsStats({ totalCount, totalOrders }: ClientsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <UsersGroupIcon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-xs text-muted-foreground">Clients</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
        <div className="rounded-md bg-emerald-500/10 p-2">
          <ShoppingCartIcon className="size-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{totalOrders}</p>
          <p className="text-xs text-muted-foreground">Commandes (page)</p>
        </div>
      </div>
    </div>
  );
}
