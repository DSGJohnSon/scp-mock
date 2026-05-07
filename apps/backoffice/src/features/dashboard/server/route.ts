import { Hono } from "hono";
import { requireMonitor } from "@/lib/middlewares";
import { handleGetStats } from "./handlers/get-stats";
import { handleGetToday } from "./handlers/get-today";
import { handleGetMonitorSchedule } from "./handlers/get-monitor-schedule";

const app = new Hono()
  // GET dashboard statistics
  .get("/stats", requireMonitor, (c) => handleGetStats(c))

  // GET today's full activity list (admin = all, monitor = their own)
  .get("/today", requireMonitor, (c) => handleGetToday(c))

  // GET monitor's daily schedule
  .get("/monitor-schedule", requireMonitor, (c) => handleGetMonitorSchedule(c));

export default app;
