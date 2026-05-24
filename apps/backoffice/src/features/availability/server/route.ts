import { Hono } from "hono";
import { requireApiKey } from "@/lib/middlewares";
import { AvailabilityService } from "@/features/availability/availability";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const CheckAvailabilitySchema = z.object({
  type: z.literal('stage'),
  itemId: z.string(),
  quantity: z.number().default(1),
});

const CheckAvailabilityBatchSchema = z.object({
  items: z
    .array(z.object({ type: z.literal('stage'), itemId: z.string() }))
    .min(1)
    .max(50),
});

const app = new Hono()
  // Check availability (POST — sends itemId in body, not suitable as query param)
  .post(
    "check",
    requireApiKey,
    zValidator("json", CheckAvailabilitySchema),
    async (c) => {
      try {
        const { type, itemId, quantity } = c.req.valid("json");

        const availability = await AvailabilityService.checkAvailability(
          type,
          itemId,
          quantity
        );

        return c.json({
          success: true,
          data: availability,
        });

      } catch (error) {
        console.error('Erreur vérification disponibilités:', error);
        return c.json({
          success: false,
          message: 'Erreur lors de la vérification des disponibilités',
          data: null,
        });
      }
    }
  )

  // Check availability for multiple items in one request
  .post(
    "check-batch",
    requireApiKey,
    zValidator("json", CheckAvailabilityBatchSchema),
    async (c) => {
      try {
        const { items } = c.req.valid("json");
        const data = await AvailabilityService.checkAvailabilityBatch(items);
        return c.json({ success: true, data });
      } catch (error) {
        console.error('Erreur vérification disponibilités batch:', error);
        return c.json({
          success: false,
          message: 'Erreur lors de la vérification des disponibilités',
          data: null,
        });
      }
    }
  )

  // Get availability for specific stage
  .get("stages/:id", requireApiKey, async (c) => {
    try {
      const stageId = c.req.param("id");

      const availability = await AvailabilityService.checkAvailability('stage', stageId);

      return c.json({
        success: true,
        data: {
          stageId,
          ...availability,
        },
      });

    } catch (error) {
      console.error('Erreur disponibilités stage:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la vérification des disponibilités du stage',
        data: null,
      });
    }
  })


  // GET available months for a given year — query params: year, stageType?
  .get("months", requireApiKey, async (c) => {
    try {
      const yearStr = c.req.query("year");
      const stageType = c.req.query("stageType") as 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE' | undefined;

      if (!yearStr) {
        return c.json({ success: false, message: "Paramètre 'year' manquant", data: null }, 400);
      }

      const year = parseInt(yearStr, 10);
      if (isNaN(year)) {
        return c.json({ success: false, message: "Paramètre 'year' invalide", data: null }, 400);
      }

      const availableMonths = await AvailabilityService.getAvailableMonths(year, stageType);

      return c.json({
        success: true,
        data: { availableMonths, year, stageType },
      });

    } catch (error) {
      console.error('Erreur récupération mois disponibles:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la récupération des mois disponibles',
        data: null,
      });
    }
  })

  // GET available periods with counts — query params: stageType?
  .get("periods", requireApiKey, async (c) => {
    try {
      const stageType = c.req.query("stageType") as 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE' | undefined;

      const periods = await AvailabilityService.getAvailablePeriodsWithCounts(stageType);

      return c.json({
        success: true,
        data: periods,
      });

    } catch (error) {
      console.error('Erreur récupération périodes disponibles:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la récupération des périodes disponibles',
        data: null,
      });
    }
  });

export default app;
