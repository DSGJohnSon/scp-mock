import { z } from "zod";

export const ChangeUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "MONITEUR", "CUSTOMER"]),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MONITEUR", "CUSTOMER"]),
});

export const UpdateUserNameSchema = z.object({
  name: z.string().min(2),
});

