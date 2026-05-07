import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CreateCampaignSchema, UpdateCampaignSchema } from "../schemas";

import { handleListCampaigns } from "./handlers/list-campaigns";
import { handleGetCampaign } from "./handlers/get-campaign";
import { handleResolveCampaign } from "./handlers/resolve-campaign";
import { handleGetContactsStatus } from "./handlers/get-contacts-status";
import { handleSendTestSms } from "./handlers/send-test-sms";
import { handleCreateCampaign } from "./handlers/create-campaign";
import { handleUpdateCampaign } from "./handlers/update-campaign";
import { handleSendCampaign } from "./handlers/send-campaign";
import { handleDeleteCampaign } from "./handlers/delete-campaign";

const app = new Hono()
  // Liste toutes les campagnes
  .get("/", requireAdmin, (c) => handleListCampaigns(c))

  // Détails d'une campagne
  .get("/:id", requireAdmin, (c) => handleGetCampaign(c))

  // Résoudre les contacts d'une campagne (aggrégation de toutes ses audiences)
  .get("/:id/resolve", requireAdmin, (c) => handleResolveCampaign(c))

  // Contacts avec leur statut d'envoi (merge résolution + logs, normalisé côté serveur)
  .get("/:id/contacts-status", requireAdmin, (c) => handleGetContactsStatus(c))

  // Envoi d'un SMS de test
  .post(
    "/test-sms",
    requireAdmin,
    zValidator(
      "json",
      z.object({
        message: z.string().min(1).max(1600),
        recipients: z.array(z.string()).min(1).max(10),
      }),
    ),
    (c) => handleSendTestSms(c),
  )

  // Création / Planification
  .post(
    "/",
    requireAdmin,
    zValidator("json", CreateCampaignSchema),
    (c) => handleCreateCampaign(c),
  )

  // Mise à jour (Seulement si DRAFT ou SCHEDULED)
  .put(
    "/:id",
    requireAdmin,
    zValidator("json", UpdateCampaignSchema),
    (c) => handleUpdateCampaign(c),
  )

  // Envoi d'une campagne "DRAFT"
  .post("/:id/send", requireAdmin, (c) => handleSendCampaign(c))

  // Supprimer
  .delete("/:id", requireAdmin, (c) => handleDeleteCampaign(c));

export default app;
