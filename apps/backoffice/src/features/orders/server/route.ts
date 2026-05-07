import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin, requireApiKey, requireCartSession } from "@/lib/middlewares";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "../schemas";
import { z } from "zod";
import { handleCreateOrder } from "./handlers/create-order";
import { handleSearchOrders } from "./handlers/search-orders";
import { handleGetOrderDetails } from "./handlers/get-order-details";
import { handleGetOrderPublic } from "./handlers/get-order-public";
import { handleUpdateOrderStatus } from "./handlers/update-order-status";
import { handleListOrders } from "./handlers/list-orders";
import { handleDeleteGhostOrders } from "./handlers/delete-ghost-orders";
import { handleFinalizeOrderItem } from "./handlers/finalize-order-item";

const app = new Hono()
  .post("/", requireApiKey, zValidator("json", CreateOrderSchema), requireCartSession, (c) => handleCreateOrder(c))
  .get("search", requireAdmin, (c) => handleSearchOrders(c))
  .get("/:id/details", requireAdmin, (c) => handleGetOrderDetails(c))
  .get("/:id", requireApiKey, (c) => handleGetOrderPublic(c))
  .patch("/:id/status", requireAdmin, zValidator("json", UpdateOrderStatusSchema), (c) => handleUpdateOrderStatus(c))
  .get("/", requireAdmin, (c) => handleListOrders(c))
  .delete("/ghost", requireAdmin, (c) => handleDeleteGhostOrders(c))
  .post(
    "/items/:orderItemId/finalize",
    requireAdmin,
    zValidator("json", z.object({ note: z.string().optional() })),
    (c) => handleFinalizeOrderItem(c),
  );

export default app;
