"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshIcon, CopyIcon } from "@/lib/icons";
import { useCreateUser } from "@/features/users/api/use-create-user";
import { toast } from "sonner";

interface UserCreateFormProps {
  onSuccess: () => void;
}

type Role = "ADMIN" | "MONITEUR" | "CUSTOMER";

function generatePassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function UserCreateForm({ onSuccess }: UserCreateFormProps) {
  const createUser = useCreateUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as Role,
  });
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const handleGenerate = () => {
    setForm((f) => ({ ...f, password: generatePassword() }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) return;

    const plainPassword = form.password;

    createUser.mutate(
      { json: form },
      {
        onSuccess: (response) => {
          if (response.success) {
            setCreatedCredentials({ email: form.email, password: plainPassword });
            toast.success(response.message);
          }
        },
      }
    );
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Email : ${createdCredentials.email}\nMot de passe : ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    toast.success("Identifiants copiés dans le presse-papiers");
  };

  if (createdCredentials) {
    return (
      <div className="flex flex-col gap-4 py-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Compte créé avec succès
          </p>
          <div className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
            <p>
              <span className="font-medium">Email :</span>{" "}
              {createdCredentials.email}
            </p>
            <p>
              <span className="font-medium">Mot de passe :</span>{" "}
              <span className="font-mono">{createdCredentials.password}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleCopyCredentials}
            className="flex-1"
          >
            <CopyIcon className="size-4 mr-2" />
            Copier les identifiants
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="flex-1"
          >
            Fermer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          placeholder="Jean Dupont"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          minLength={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="jean@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe temporaire</Label>
        <div className="flex gap-2">
          <Input
            id="password"
            type="text"
            placeholder="Min. 6 caractères"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
            minLength={6}
            className="font-mono"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerate}
            className="shrink-0"
            title="Générer un mot de passe"
          >
            <RefreshIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Rôle</Label>
        <Select
          value={form.role}
          onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}
        >
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUSTOMER">Client</SelectItem>
            <SelectItem value="MONITEUR">Moniteur</SelectItem>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="mt-2"
        disabled={createUser.isPending}
      >
        {createUser.isPending ? "Création…" : "Créer le compte"}
      </Button>
    </form>
  );
}
