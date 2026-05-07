# Contributing

## Prerequisites

- Node.js 20+
- pnpm 9+
- A PostgreSQL database (see `apps/backoffice/.env.example`)

## Setup

```bash
pnpm install
cp apps/backoffice/.env.example apps/backoffice/.env.local
cp apps/front/.env.example apps/front/.env.local
# Fill in both .env.local files
cd apps/backoffice && pnpm db:migrate
```

## Running the project

```bash
pnpm dev          # Start both apps (front :3000, backoffice :3001)
pnpm test         # Run all Vitest tests
pnpm lint         # Lint all packages
pnpm typecheck    # Type-check all packages
```

## Git workflow

1. Branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes
3. Run `pnpm test && pnpm lint && pnpm typecheck` before committing
4. Open a PR against `main`

## Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short description>

Types:  feat | fix | chore | docs | refactor | test | ci
Scope:  optional — e.g. stages, orders, checkout, db, ci
```

Examples:

```
feat(orders): add manual payment recording
fix(cart): prevent double-add on rapid click
docs(challenges): expand payment allocation section
test(webhook): add duplicate event test case
chore(deps): upgrade Prisma to 6.17
```

Keep the subject line under 72 characters. No period at the end.

## Tests

Tests live in `apps/backoffice/src/__tests__/`. Run with:

```bash
cd apps/backoffice
pnpm test            # Single run
pnpm test:watch      # Watch mode
pnpm test:coverage   # Coverage report
```

New tests should follow the existing pattern: unit tests with Prisma and
external SDK calls mocked via `vi.mock`. See the existing test files for
examples.
