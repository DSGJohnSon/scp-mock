import { Hono } from "hono";
import { requireAdmin, requireMonitor } from "@/lib/middlewares";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { handleListReservations } from "./handlers/list-reservations";
import { handleGetReservation } from "./handlers/get-reservation";
import { handleRecordManualPayment } from "./handlers/record-manual-payment";
import { handleRecordFinalDiscount } from "./handlers/record-final-discount";

const RecordManualPaymentSchema = z.object({
  orderItemId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "CASH", "CHECK"]),
  note: z.string().optional(),
});

const RecordFinalDiscountSchema = z.object({
  orderItemId: z.string(),
  amount: z.number().positive(),
  note: z.string().optional(),
});

const GetReservationsSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  type: z.enum(["ALL", "STAGE"]).optional().default("ALL"),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

const app = new Hono()
  .get("/", requireMonitor, zValidator("query", GetReservationsSchema), (c) => handleListReservations(c))
  .get("/:id", requireMonitor, (c) => handleGetReservation(c))
  .post("/manual-payment", requireAdmin, zValidator("json", RecordManualPaymentSchema), (c) => handleRecordManualPayment(c))
  .post("/final-discount", requireAdmin, zValidator("json", RecordFinalDiscountSchema), (c) => handleRecordFinalDiscount(c));

export default app;
