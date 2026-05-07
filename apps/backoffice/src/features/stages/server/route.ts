import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin, requireApiKey, requireAuth } from "@/lib/middlewares";
import {
  CreateStageSchema,
  UpdateStageSchema,
  ApplyStagePromotionSchema,
} from "../schemas";
import { handleListStages } from "./handlers/list-stages";
import { handleGetStage } from "./handlers/get-stage";
import { handleCreateStage } from "./handlers/create-stage";
import { handleUpdateStage } from "./handlers/update-stage";
import { handleApplyStagePromotion } from "./handlers/apply-stage-promotion";
import { handleCancelStagePromotion } from "./handlers/cancel-stage-promotion";
import { handleDeleteStage } from "./handlers/delete-stage";

const app = new Hono()
  // GET /stages — list all stages
  .get("/", requireApiKey, (c) => handleListStages(c))
  // GET /stages/:id — get one stage by id
  .get("/:id", requireAuth, (c) => handleGetStage(c))
  // POST /stages — create a stage
  .post("/", zValidator("json", CreateStageSchema), requireAdmin, (c) => handleCreateStage(c))
  // PUT /stages/:id — update a stage
  .put("/:id", zValidator("json", UpdateStageSchema), requireAdmin, (c) => handleUpdateStage(c))
  // PATCH /stages/:id/promote — apply a promotion to a stage
  .patch("/:id/promote", requireAdmin, zValidator("json", ApplyStagePromotionSchema), (c) => handleApplyStagePromotion(c))
  // DELETE /stages/:id/promote — cancel promotion on a stage
  .delete("/:id/promote", requireAdmin, (c) => handleCancelStagePromotion(c))
  // DELETE /stages/:id — delete a stage
  .delete("/:id", requireAdmin, (c) => handleDeleteStage(c));

export default app;
