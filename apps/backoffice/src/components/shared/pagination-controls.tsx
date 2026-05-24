import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: string) => void;
}

export function PaginationControls({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Afficher</span>
        <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">par page</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-4">
          Page {page} sur {totalPages || 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
