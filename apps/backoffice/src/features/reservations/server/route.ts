import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { requireAdmin, requireMonitor } from "@/lib/middlewares";
import {
  CreateReservationSchema,
  GetReservationsSchema,
  RecordManualPaymentSchema,
} from "../schemas";
import { handleListReservations } from "./handlers/list-reservations";
import { handleGetReservation } from "./handlers/get-reservation";
import { handleCreateReservation } from "./handlers/create-reservation";
import { handleRecordManualPayment } from "./handlers/record-manual-payment";
import { handleCancelReservation } from "./handlers/cancel-reservation";

const app = new Hono()
  .get("/", requireMonitor, zValidator("query", GetReservationsSchema), (c) =>
    handleListReservations(c),
  )
  .get("/:id", requireMonitor, (c) => handleGetReservation(c))
  .post(
    "/",
    requireAdmin,
    zValidator("json", CreateReservationSchema),
    (c) => handleCreateReservation(c),
  )
  .post(
    "/manual-payment",
    requireAdmin,
    zValidator("json", RecordManualPaymentSchema),
    (c) => handleRecordManualPayment(c),
  )
  .delete("/:id", requireAdmin, (c) => handleCancelReservation(c));

export default app;
