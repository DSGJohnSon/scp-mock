import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import { handleGetAnnual } from "./handlers/get-annual";
import { handleGetMonthly } from "./handlers/get-monthly";

const app = new Hono()
  .get("/annual", requireAdmin, (c) => handleGetAnnual(c))
  .get("/monthly", requireAdmin, (c) => handleGetMonthly(c));

export default app;
