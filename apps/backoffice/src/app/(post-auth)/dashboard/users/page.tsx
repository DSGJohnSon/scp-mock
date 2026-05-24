"use client";

import { ResponsiveModal } from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/lib/icons";
import { useGetAllUsers } from "@/features/users/api/use-get-users";
import { useCurrent } from "@/features/auth/api/use-current";
import { UsersStats } from "./_components/users-stats";
import { UsersTable } from "./_components/users-table";
import { UsersToolbar } from "./_components/users-toolbar";
import { UserCreateForm } from "./_components/(forms)/user-create-form";
import { useUsersPage } from "./_hooks/use-users-page";

export default function UsersPage() {
  const { data: users, isLoading, isError, refetch } = useGetAllUsers();
  const { data: currentUser } = useCurrent();

  const {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    isCreateOpen,
    setIsCreateOpen,
    filteredUsers,
    stats,
  } = useUsersPage(users ?? null);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <p className="text-sm text-muted-foreground animate-pulse">
          Chargement des utilisateurs…
        </p>
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">
          Impossible de charger les utilisateurs.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshIcon className="size-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez tous les comptes de l&apos;application
        </p>
      </div>

      <UsersStats
        total={stats.total}
        admins={stats.admins}
        moniteurs={stats.moniteurs}
      />

      <UsersToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <UsersTable users={filteredUsers} currentUserId={currentUser?.id} />

      <ResponsiveModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Créer un utilisateur"
        description="Renseignez les informations du nouveau compte"
        dialogClassName="w-full sm:max-w-md overflow-y-auto max-h-[85vh]"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Nouvel utilisateur</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Renseignez les informations du nouveau compte
          </p>
          <UserCreateForm onSuccess={() => setIsCreateOpen(false)} />
        </div>
      </ResponsiveModal>
    </main>
  );
}
