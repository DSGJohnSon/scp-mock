# Architecture Decision Records

Short ADRs for the key design choices in this codebase. Each entry records the context, the decision made, and its consequences — good and bad.

---

## ADR-01 — Hono inside Next.js instead of native Route Handlers

**Context:** The backoffice exposes a REST API consumed by the public frontend. Next.js App Router provides route handlers out of the box, but they offer no middleware composition, no typed request validation, and no clean way to share authentication logic across routes.

**Decision:** Mount Hono at `src/app/api/[[...route]]/route.ts` as a catch-all. All API routes are defined in Hono, which provides middleware chaining, Zod validation via `@hono/zod-validator`, and a consistent `{ success, data?, error? }` response shape.

**Consequences:** API code is portable — it could be extracted to a standalone Hono server without touching the route logic. The trade-off is that better-auth's own `/api/auth/*` handler must be registered *before* the Hono catch-all in Next.js, and the two handlers can't share request context directly. Hono's typed RPC client is available but not wired to the frontend yet — all calls still use raw `fetch`.

---

## ADR-02 — Turborepo monorepo instead of two separate repos

**Context:** The frontend and backoffice share a Prisma schema, TypeScript types, and must be kept in sync. Maintaining them as separate repos means duplicating type definitions, managing cross-repo versioning, and making schema changes in two places.

**Decision:** Single Turborepo monorepo with pnpm workspaces. The shared Prisma client lives in `packages/db`, shared types in `packages/types`. Turborepo's task graph ensures packages are built before the apps that depend on them.

**Consequences:** A single `pnpm install` sets up the entire stack. CI runs all checks in one pipeline. The cost is that the repo is larger and developers unfamiliar with monorepos may find the workspace structure surprising. Turborepo's remote caching could speed up CI further but is not configured here.

---

## ADR-03 — better-auth instead of NextAuth (Auth.js)

**Context:** The backoffice requires email/password auth with role-based access (`ADMIN`, `MONITEUR`). The public frontend is entirely anonymous — no auth required for customers.

**Decision:** better-auth, which provides email/password, session management, password reset via email, and a typed client with `inferAdditionalFields` for custom schema fields (`role`, `avatarUrl`). The server config lives in `src/lib/auth.ts`; the client in `src/lib/auth-client.ts`.

**Consequences:** better-auth is newer and less battle-tested than NextAuth, but its TypeScript support is significantly better — role fields are typed end-to-end without manual casting. The `getCurrent()` server action returns a full Prisma `User` (not the better-auth session user) to ensure downstream components get correct Prisma types including the `Role` enum. One gotcha: all auth middleware uses `auth.api.getSession({ headers })` — never manual cookie extraction, which would break under Vercel's edge runtime.

---

## ADR-04 — React 18 on front, React 19 on backoffice

**Context:** React 19 shipped with significant changes to the concurrent rendering model and improved server component support. The backoffice was greenfield when React 19 reached stable; the frontend predates it.

**Decision:** Upgrade the backoffice to React 19 immediately (lower risk surface, no customer-facing regressions possible). Keep the frontend on React 18 until a dedicated testing pass can cover the checkout flow, which is the most complex and revenue-critical part of the codebase.

**Consequences:** The monorepo intentionally runs two React versions. This is possible because the two apps are separate Next.js deployments with no shared runtime. The decision documents a deliberate tradeoff rather than an oversight — upgrading dependencies on a checkout flow without testing is how you lose revenue at 2am on a Saturday.

---

## ADR-05 — Feature-based layout instead of layer-based layout

**Context:** A layer-based layout (`components/`, `hooks/`, `utils/`, `services/`) scales poorly: adding a feature means touching four directories, and there's no natural boundary for what belongs to which domain.

**Decision:** Each domain owns a directory under `src/features/<domain>/` with its own `server/` (Hono handlers), `api/` (TanStack Query hooks), `components/`, `forms/`, and `schemas.ts`. Pages in `src/app/(post-auth)/dashboard/<domain>/` are thin shells importing from the feature.

**Consequences:** Domain code is colocated — reading a feature means reading one directory, not four. Deleting a feature means deleting one directory. The cost is that cross-domain utilities end up in `src/lib/`, which can become a dumping ground if not actively curated.

---

## ADR-06 — Feature flags in a config file instead of Git branches

**Context:** Some features are work-in-progress but partially deployed (gift voucher wizard, SMS campaigns). The options are feature branches (require rebasing, risky to merge) or runtime feature flags.

**Decision:** A `features.ts` config file in the frontend exports boolean flags (`ENABLE_GIFT_VOUCHERS`, `ENABLE_BAPTEME_BOOKING`, etc.). Components check the flag and render `null` if disabled. The flags are static — evaluated at build time, not at runtime — so no feature flag service is needed.

**Consequences:** Simple, zero-dependency solution that works for a codebase with a single deployment environment. Not suitable for A/B testing or per-user rollouts. Disabling a feature removes it from the build entirely, which is a security property (no dead code paths), but also means re-enabling requires a redeploy.

---

## ADR-07 — Pricing in a config file instead of the database

**Context:** Stages and baptism prices need to be configurable. The options are a `pricing` database table (flexible, admin-editable) or a config file in the source tree (simple, auditable via git).

**Decision:** Pricing is defined in a TypeScript config file (`src/lib/pricing.ts` or similar). Changes require a code change and a deployment.

**Consequences:** Every pricing change is tracked in git history with a commit message and author. There's no admin UI for prices — which is a feature for a portfolio project (no accidental changes) and a limitation for a real deployment. If this were production software with a non-technical client, the pricing would move to the database. For a vitrine, the simplicity wins.

---

## ADR-08 — Vitest on the three "pépites", not coverage-first testing

**Context:** The codebase has roughly 50 files of business logic. A coverage-first approach would require mocking the entire Prisma client, the Stripe SDK, better-auth, and Resend for every test — resulting in tests that test mocks rather than behavior.

**Decision:** Write tests only for the three high-value, self-contained modules: availability checking, Stripe webhook handling, and order/payment processing. These are the modules where a bug has immediate financial or operational consequences. Everything else is covered by TypeScript's type checker and manual testing.

**Consequences:** 107 tests, 0 coverage targets. The tests that exist are meaningful and maintainable. The trade-off is that UI components, API route handlers, and email templates are untested by automated tests — regressions there require manual discovery. For a portfolio project, the trade-off is acceptable. For a production system processing real payments, the webhook handler tests alone justify the setup cost.
