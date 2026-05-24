import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin, requireAuth, requireMonitor } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ChangeUserRoleSchema, CreateUserSchema, UpdateUserNameSchema } from "../schemas";

const app = new Hono()
  //*------------------*//
  //ALL GET REQUESTS API
  //*------------------*//
  //Get all users of the database
  .get("/", requireAdmin, async (c) => {
    try {
      const result = await prisma.user.findMany();
      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching users",
        data: null,
      });
    }
  })
  //
  //Get one user by id
  .get("/:id", requireAuth, async (c) => {
    const { id } = c.req.param();
    if (!id) {
      return c.json({
        success: false,
        message: "User ID is required",
        data: null,
      });
    }

    try {
      const result = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching users by id",
        data: null,
      });
    }
  })
  //
  //Get all users by type
  .get("/by-role/:role", requireMonitor, async (c) => {
    const { role } = c.req.param();
    const typedRole = role as Role;
    if (!role || !Object.values(Role).includes(typedRole)) {
      return c.json({
        success: false,
        message: "Role ('ADMIN', 'MONITEUR', 'CUSTOMER') is required",
        data: null,
      });
    }

    try {
      const result = await prisma.user.findMany({
        where: {
          role: typedRole,
        },
      });

      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching user",
        data: null,
      });
    }
  })
  //
  // PATCH /users/:id/role — change user role
  .patch(
    "/:id/role",
    requireAdmin,
    zValidator("json", ChangeUserRoleSchema),
    async (c) => {
      const id = c.req.param("id");
      const { role } = c.req.valid("json");
      if (!id || !role) {
        return c.json({
          success: false,
          message: "Un user et un role sont requis",
          data: null,
        });
      }

      try {
        const result = await prisma.user.update({
          where: { id },
          data: { role: role as Role },
        });

        return c.json({
          success: true,
          message: `Rôle de ${result.name} mis à jour vers "${role}"`,
          data: result,
        });
      } catch (error) {
        return c.json({
          success: false,
          message: "Error updating user",
          data: null,
        });
      }
    }
  )
  //
  // POST /users — create a new user with credentials
  .post("/", requireAdmin, zValidator("json", CreateUserSchema), async (c) => {
    const { name, email, password, role } = c.req.valid("json");

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return c.json({
          success: false,
          message: "Un compte avec cet email existe déjà",
          data: null,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: userId,
            name,
            email,
            emailVerified: false,
            role: role as Role,
          },
        });
        await tx.account.create({
          data: {
            id: crypto.randomUUID(),
            accountId: userId,
            providerId: "credential",
            userId,
            password: hashedPassword,
          },
        });
        return user;
      });

      return c.json({
        success: true,
        message: `Compte de ${result.name} créé avec succès`,
        data: result,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la création du compte",
        data: null,
      });
    }
  })
  //
  // PATCH /users/:id/name — update user name
  .patch(
    "/:id/name",
    requireAdmin,
    zValidator("json", UpdateUserNameSchema),
    async (c) => {
      const id = c.req.param("id");
      const { name } = c.req.valid("json");

      try {
        const result = await prisma.user.update({
          where: { id },
          data: { name },
        });

        return c.json({
          success: true,
          message: `Nom mis à jour : ${result.name}`,
          data: result,
        });
      } catch (error) {
        return c.json({
          success: false,
          message: "Erreur lors de la mise à jour du nom",
          data: null,
        });
      }
    }
  );
//
export default app;
