import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlusIcon } from "@/lib/icons";

interface StagiairesToolbarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onCreateClick: () => void;
}

export function StagiairesToolbar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onCreateClick,
}: StagiairesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form onSubmit={onSearchSubmit} className="flex gap-2 flex-1">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Rechercher
        </Button>
      </form>

      <Button onClick={onCreateClick} className="shrink-0">
        <PlusIcon className="size-4 mr-2" />
        Nouveau stagiaire
      </Button>
    </div>
  );
}
