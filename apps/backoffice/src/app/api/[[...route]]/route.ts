import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "@/features/users/server/route";
import clients from "@/features/clients/server/route";
import stagiaires from "@/features/stagiaires/server/route";
import stages from "@/features/stages/server/route";
import reservations from "@/features/reservations/server/route";
import promocodes from "@/features/promocodes/server/route";
import cart from "@/features/cart/server/route";
import availability from "@/features/availability/server/route";
import orders from "@/features/orders/server/route";
import payments from "@/features/payments/server/route";
import dashboard from "@/features/dashboard/server/route";
import { cors } from "hono/cors";

const app = new Hono().basePath("/api");

const routes = app
  .use(
    "*",
    cors({
      origin: (origin) => {
        return [
          "http://localhost:3000",
          "http://localhost:3001",
        ].includes(origin ?? "")
          ? origin
          : "";
      },
      allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "x-api-key", "x-session-id"],
    }),
  )
  .route("/users", users)
  .route("/clients", clients)
  .route("/stagiaires", stagiaires)
  .route("/stages", stages)
  .route("/reservations", reservations)
  .route("/promocodes", promocodes)
  .route("/cart", cart)
  .route("/availability", availability)
  .route("/orders", orders)
  .route("/payments", payments)
  .route("/dashboard", dashboard)

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof routes;
