export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MONITEUR" | "CUSTOMER";
  avatarUrl?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type RoleFilter = "ALL" | "ADMIN" | "MONITEUR" | "CUSTOMER";
