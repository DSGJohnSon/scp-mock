import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireApiKey, requireCartSession } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { z } from "zod";
import type { ParticipantData } from "@/lib/participant-data";
import { AvailabilityService } from "@/lib/availability";

const AddToCartSchema = z
  .object({
    type: z.literal("STAGE"),
    itemId: z.string(),
    participantData: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
      birthDate: z.string().optional(),
      selectedStageType: z.string().optional(),
    }),
    quantity: z.number().default(1),
  })
  .refine(
    (data) => {
      return (
        !!data.participantData.firstName &&
        !!data.participantData.lastName &&
        !!data.participantData.email &&
        !!data.participantData.phone &&
        data.participantData.weight !== undefined &&
        data.participantData.height !== undefined
      );
    },
    { message: "Champs participant requis manquants", path: ["participantData"] },
  );

const UpdateCartItemSchema = z.object({
  quantity: z.number().optional(),
  participantData: z
    .object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(10).optional(),
      weight: z.number().min(20).max(120).optional(),
      height: z.number().min(120).max(220).optional(),
      birthDate: z.string().optional(),
      selectedStageType: z.string().optional(),
    })
    .optional(),
});

const app = new Hono()
  // GET cart items
  .get("items", requireApiKey, requireCartSession, async (c) => {
    try {
      const cartSession = c.get("cartSession");
      const now = new Date();

      const allCartItems = await prisma.cartItem.findMany({
        where: { cartSessionId: cartSession.id },
        include: { stage: true },
        orderBy: { createdAt: "desc" },
      });

      const expiredItemIds: string[] = [];
      const validItems = allCartItems.filter((item) => {
        if (item.expiresAt && new Date(item.expiresAt) <= now) {
          expiredItemIds.push(item.id);
          return false;
        }
        return true;
      });

      if (expiredItemIds.length > 0) {
        await prisma.cartItem.deleteMany({ where: { id: { in: expiredItemIds } } });
      }

      let totalAmount = 0;
      for (const item of validItems) {
        if (item.stage) {
          totalAmount += item.stage.acomptePrice * item.quantity;
        }
      }

      return c.json({
        success: true,
        data: { items: validItems, totalAmount, itemCount: validItems.length },
      });
    } catch (error) {
      console.error("Erreur récupération panier:", error);
      return c.json({ success: false, message: "Erreur lors de la récupération du panier", data: null });
    }
  })

  // ADD item to cart
  .post(
    "items",
    requireApiKey,
    zValidator("json", AddToCartSchema),
    requireCartSession,
    async (c) => {
      try {
        const { itemId, participantData, quantity } = c.req.valid("json");
        const cartSession = c.get("cartSession");

        const availability = await AvailabilityService.checkAvailability("stage", itemId, quantity);

        if (!availability.available) {
          return c.json({ success: false, message: availability.reason || "Places non disponibles", data: null });
        }

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1h

        const cartItem = await prisma.cartItem.create({
          data: {
            type: "STAGE",
            quantity,
            stageId: itemId,
            participantData,
            cartSessionId: cartSession.id,
            expiresAt,
            isExpired: false,
          },
          include: { stage: true },
        });

        return c.json({ success: true, message: "Article ajouté au panier", data: cartItem });
      } catch (error) {
        console.error("Erreur ajout panier:", error);
        return c.json({
          success: false,
          message: error instanceof Error ? error.message : "Erreur lors de l'ajout au panier",
          data: null,
        });
      }
    },
  )

  // UPDATE cart item
  .put(
    "items/:id",
    requireApiKey,
    zValidator("json", UpdateCartItemSchema),
    requireCartSession,
    async (c) => {
      try {
        const itemId = c.req.param("id");
        const updateData = c.req.valid("json");
        const cartSession = c.get("cartSession");

        const existingItem = await prisma.cartItem.findFirst({
          where: { id: itemId, cartSessionId: cartSession.id },
        });

        if (!existingItem) {
          return c.json({ success: false, message: "Article introuvable dans votre panier", data: null });
        }

        const updatedItem = await prisma.cartItem.update({
          where: { id: itemId },
          data: updateData,
          include: { stage: true },
        });

        return c.json({ success: true, message: "Article mis à jour", data: updatedItem });
      } catch (error) {
        console.error("Erreur mise à jour panier:", error);
        return c.json({ success: false, message: "Erreur lors de la mise à jour", data: null });
      }
    },
  )

  // PATCH cart item (with price recalculation)
  .patch(
    "items/:id",
    requireApiKey,
    zValidator("json", UpdateCartItemSchema),
    requireCartSession,
    async (c) => {
      try {
        const itemId = c.req.param("id");
        const updateData = c.req.valid("json");
        const cartSession = c.get("cartSession");

        const existingItem = await prisma.cartItem.findFirst({
          where: { id: itemId, cartSessionId: cartSession.id },
          include: { stage: true },
        });

        if (!existingItem) {
          return c.json({ success: false, message: "Article introuvable dans votre panier", data: null }, 404);
        }

        if (updateData.participantData) {
          const { weight, height, email, phone } = updateData.participantData;

          if (weight !== undefined && (weight < 20 || weight > 120)) {
            return c.json({ success: false, message: "Le poids doit être entre 20 et 120 kg", data: null }, 400);
          }
          if (height !== undefined && (height < 120 || height > 220)) {
            return c.json({ success: false, message: "La taille doit être entre 120 et 220 cm", data: null }, 400);
          }
          if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return c.json({ success: false, message: "Format d'email invalide", data: null }, 400);
          }
          if (phone !== undefined && !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(phone.replace(/\s/g, ""))) {
            return c.json({ success: false, message: "Format de téléphone invalide", data: null }, 400);
          }
        }

        const dataToUpdate: any = {};
        if (updateData.quantity !== undefined) dataToUpdate.quantity = updateData.quantity;
        if (updateData.participantData) {
          const oldData = existingItem.participantData as ParticipantData | null;
          dataToUpdate.participantData = { ...oldData, ...updateData.participantData };
        }

        const updatedItem = await prisma.cartItem.update({
          where: { id: itemId },
          data: dataToUpdate,
          include: { stage: true },
        });

        const allCartItems = await prisma.cartItem.findMany({
          where: { cartSessionId: cartSession.id },
          include: { stage: true },
        });

        let totalAmount = 0;
        for (const item of allCartItems) {
          if (item.stage) totalAmount += item.stage.acomptePrice * item.quantity;
        }

        return c.json({
          success: true,
          message: "Article mis à jour avec succès",
          data: {
            item: updatedItem,
            cart: { id: cartSession.id, items: allCartItems, totalAmount, itemCount: allCartItems.length },
          },
        });
      } catch (error) {
        console.error("[CART UPDATE ERROR]", error);
        return c.json({
          success: false,
          message: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
          data: null,
        }, 500);
      }
    },
  )

  // REMOVE item from cart
  .delete("items/:id", requireApiKey, requireCartSession, async (c) => {
    try {
      const itemId = c.req.param("id");
      const cartSession = c.get("cartSession");

      const existingItem = await prisma.cartItem.findFirst({
        where: { id: itemId, cartSessionId: cartSession.id },
      });

      if (!existingItem) {
        return c.json({ success: false, message: "Article introuvable dans votre panier", data: null });
      }

      await prisma.cartItem.delete({ where: { id: itemId } });

      return c.json({ success: true, message: "Article supprimé du panier", data: null });
    } catch (error) {
      console.error("Erreur suppression panier:", error);
      return c.json({ success: false, message: "Erreur lors de la suppression", data: null });
    }
  })

  // CLEAR cart
  .delete("items", requireApiKey, requireCartSession, async (c) => {
    try {
      const cartSession = c.get("cartSession");

      await prisma.cartItem.deleteMany({ where: { cartSessionId: cartSession.id } });

      return c.json({ success: true, message: "Panier vidé", data: null });
    } catch (error) {
      console.error("Erreur vidage panier:", error);
      return c.json({ success: false, message: "Erreur lors du vidage du panier", data: null });
    }
  });

export default app;
