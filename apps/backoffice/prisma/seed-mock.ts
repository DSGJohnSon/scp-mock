/**
 * seed-mock.ts
 *
 * Reset complet de la BDD + injection de données mock :
 *   - 1 admin   : admin@scp.fr          / Admin@2024
 *   - 3 moniteurs (better-auth accounts)
 *   - Stages saison Juin–Septembre 2026
 *     · INITIATION  (7j)  chaque semaine    → Armand PRATTER
 *     · PROGRESSION (7j)  chaque semaine    → Benoît PUECH
 *     · AUTONOMIE  (14j)  toutes les 2 sem. → Romain BERNARD
 *
 * Usage :
 *   cd apps/backoffice
 *   pnpm seed:mock
 */

// Charger .env.local AVANT tout import qui lit les variables d'env
import { config } from "dotenv";
config({ path: ".env.local" });

// ─── Config saison ────────────────────────────────────────────────────────────

const SEASON_START = new Date("2026-06-06T00:00:00.000Z"); // 1er samedi de juin 2026
const SEASON_END   = new Date("2026-10-01T00:00:00.000Z"); // exclusif — inclut le 26 sept

const STAGE_CONFIG = {
  INITIATION:  { price: 890,  acomptePrice: 200, places: 8  },
  PROGRESSION: { price: 1090, acomptePrice: 250, places: 6  },
  AUTONOMIE:   { price: 1490, acomptePrice: 300, places: 4  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retourne tous les samedis entre `from` (inclus) et `to` (exclusif) */
function collectSaturdays(from: Date, to: Date): Date[] {
  const saturdays: Date[] = [];
  const cursor = new Date(from);
  // Avancer jusqu'au premier samedi si `from` n'en est pas un
  while (cursor.getUTCDay() !== 6) cursor.setUTCDate(cursor.getUTCDate() + 1);
  while (cursor < to) {
    saturdays.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return saturdays;
}

/** Retourne un samedi sur deux (indices pairs) */
function everyOtherSaturday(from: Date, to: Date): Date[] {
  return collectSaturdays(from, to).filter((_, i) => i % 2 === 0);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Imports dynamiques — env déjà chargé au-dessus
  const { auth }           = await import("../src/lib/auth/auth");
  const { default: prisma } = await import("../src/lib/prisma");

  console.log("\n🪂  SCP — Seed mock\n");

  // ── 1. Reset complet ──────────────────────────────────────────────────────
  console.log("🗑   Reset de la base de données...");

  // TRUNCATE CASCADE gère les dépendances circulaires (OrderItem ↔ StageBooking)
  // Les tables better-auth ont @@map en minuscules, les autres gardent le nom PascalCase du modèle
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "ProcessedWebhookEvent",
      "PaymentAllocation",
      "Payment",
      "PromoCodeUsage",
      "StageBooking",
      "OrderItem",
      "Order",
      "CartItem",
      "CartSession",
      "StageMoniteur",
      "StagePromotionHistory",
      "Stage",
      "Client",
      "Stagiaire",
      "PromoCode",
      verification,
      session,
      account,
      "user"
    CASCADE
  `);
  console.log("    ✓ Toutes les tables vidées\n");

  // ── 2. Admin ──────────────────────────────────────────────────────────────
  console.log("👤  Création de l'admin...");
  const adminSignUp = await auth.api.signUpEmail({
    body: { name: "Admin SCP", email: "admin@scp.fr", password: "Admin@2024" },
  });
  if (!adminSignUp?.user) throw new Error("Échec de la création de l'admin");

  await prisma.user.update({
    where: { email: "admin@scp.fr" },
    data:  { role: "ADMIN" },
  });
  console.log("    ✓ admin@scp.fr  /  Admin@2024\n");

  // ── 3. Moniteurs ──────────────────────────────────────────────────────────
  console.log("👥  Création des moniteurs...");

  const MONITEURS = [
    { name: "Armand PRATTER", email: "armand@pratter.fr"  },
    { name: "Benoît PUECH",   email: "benoit@puech.fr"    },
    { name: "Romain BERNARD", email: "romain@bernard.fr"  },
  ] as const;

  const moniteurIds: Record<string, string> = {};

  for (const moniteur of MONITEURS) {
    const result = await auth.api.signUpEmail({
      body: { name: moniteur.name, email: moniteur.email, password: "Moniteur@2024" },
    });
    if (!result?.user) throw new Error(`Échec de la création de ${moniteur.email}`);

    const user = await prisma.user.update({
      where: { email: moniteur.email },
      data:  { role: "MONITEUR" },
    });
    moniteurIds[moniteur.name] = user.id;
    console.log(`    ✓ ${moniteur.email}`);
  }
  console.log();

  const armandId = moniteurIds["Armand PRATTER"];
  const benoitId = moniteurIds["Benoît PUECH"];
  const romainId = moniteurIds["Romain BERNARD"];

  // ── 4. Stages saison 2026 ──────────────────────────────────────────────────
  console.log("🏔   Génération des stages (saison Juin–Septembre 2026)...");

  const weeklySats   = collectSaturdays(SEASON_START, SEASON_END);
  const biweeklySats = everyOtherSaturday(SEASON_START, SEASON_END);

  // — INITIATION : chaque semaine, 7 jours, Armand
  for (const startDate of weeklySats) {
    await prisma.stage.create({
      data: {
        startDate,
        duration: 7,
        type: "INITIATION",
        ...STAGE_CONFIG.INITIATION,
        moniteurs: { create: { moniteurId: armandId } },
      },
    });
  }
  console.log(
    `    ✓ ${weeklySats.length} × INITIATION  (7j, hebdo) — Armand PRATTER`
  );

  // — PROGRESSION : chaque semaine, 7 jours, Benoît
  for (const startDate of weeklySats) {
    await prisma.stage.create({
      data: {
        startDate,
        duration: 7,
        type: "PROGRESSION",
        ...STAGE_CONFIG.PROGRESSION,
        moniteurs: { create: { moniteurId: benoitId } },
      },
    });
  }
  console.log(
    `    ✓ ${weeklySats.length} × PROGRESSION (7j, hebdo) — Benoît PUECH`
  );

  // — AUTONOMIE : toutes les 2 semaines, 14 jours, Romain
  for (const startDate of biweeklySats) {
    await prisma.stage.create({
      data: {
        startDate,
        duration: 14,
        type: "AUTONOMIE",
        ...STAGE_CONFIG.AUTONOMIE,
        moniteurs: { create: { moniteurId: romainId } },
      },
    });
  }
  console.log(
    `    ✓ ${biweeklySats.length} × AUTONOMIE  (14j, bi-hebdo) — Romain BERNARD`
  );

  const total = weeklySats.length * 2 + biweeklySats.length;

  console.log(`\n✅  Seed terminé — ${total} stages créés.\n`);
  console.log("─────────────────────────────────────────");
  console.log("  Comptes créés :");
  console.log("  admin@scp.fr          Admin@2024      [ADMIN]");
  console.log("  armand@pratter.fr     Moniteur@2024   [MONITEUR]");
  console.log("  benoit@puech.fr       Moniteur@2024   [MONITEUR]");
  console.log("  romain@bernard.fr     Moniteur@2024   [MONITEUR]");
  console.log("─────────────────────────────────────────\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Seed échoué :", err);
  process.exit(1);
});
