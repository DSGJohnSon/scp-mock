import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDownIcon2,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@/lib/icons";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ClientsTableRow } from "./clients-table-row";
import { AppClient } from "../_types";

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== column)
    return <ArrowUpDownIcon2 className="ml-1.5 h-3.5 w-3.5 opacity-50" />;
  return sortOrder === "asc" ? (
    <ChevronUpIcon className="ml-1.5 h-3.5 w-3.5" />
  ) : (
    <ChevronDownIcon className="ml-1.5 h-3.5 w-3.5" />
  );
}

interface ClientsTableProps {
  clients: AppClient[];
  totalCount: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: string) => void;
  onDetailClick: (client: AppClient) => void;
}

export function ClientsTable({
  clients,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onPageSizeChange,
  onDetailClick,
}: ClientsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const sortProps = { sortBy, sortOrder };

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Liste des clients</p>
          <p className="text-xs text-muted-foreground">{totalCount} client{totalCount !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center">
                  Client <SortIcon column="name" {...sortProps} />
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => onSort("orders")}
              >
                <div className="flex items-center">
                  Commandes <SortIcon column="orders" {...sortProps} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => onSort("createdAt")}
              >
                <div className="flex items-center">
                  Inscrit le <SortIcon column="createdAt" {...sortProps} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-10"
                >
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <ClientsTableRow
                  key={client.id}
                  client={client}
                  onDetailClick={onDetailClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-4 pb-4">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
