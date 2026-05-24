import { TableCell } from "@/components/ui/table";
import { UserIcon } from "@/lib/icons";
import CopyTextComponent from "@/components/shared/copy-text-component";

interface ContactIdentityCellProps {
  firstName: string;
  lastName: string;
  id: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export function ContactIdentityCell({
  firstName,
  lastName,
  id,
  badge,
  onClick,
}: ContactIdentityCellProps) {
  return (
    <TableCell>
      <div
        className={`flex items-center gap-2 ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <UserIcon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${onClick ? "hover:underline" : ""}`}>
              {firstName} {lastName}
            </span>
            {badge}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              ID: {id.slice(0, 8)}…
            </span>
            <CopyTextComponent text={id} size="sm" />
          </div>
        </div>
      </div>
    </TableCell>
  );
}
