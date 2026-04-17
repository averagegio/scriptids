import { getSql } from "@/lib/db";

export type ClinicAccessRow = {
  email: string;
  planId: string | null;
  status: "active" | "inactive";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: string;
};

export async function ensureClinicAccessTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS clinic_access (
      email TEXT PRIMARY KEY,
      plan_id TEXT,
      status TEXT NOT NULL DEFAULT 'inactive',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export async function upsertClinicAccess(params: {
  email: string;
  planId: string | null;
  status: "active" | "inactive";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const sql = getSql();
  await ensureClinicAccessTable();
  await sql`
    INSERT INTO clinic_access (
      email,
      plan_id,
      status,
      stripe_customer_id,
      stripe_subscription_id,
      updated_at
    )
    VALUES (
      ${params.email},
      ${params.planId},
      ${params.status},
      ${params.stripeCustomerId ?? null},
      ${params.stripeSubscriptionId ?? null},
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      plan_id = EXCLUDED.plan_id,
      status = EXCLUDED.status,
      stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, clinic_access.stripe_customer_id),
      stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, clinic_access.stripe_subscription_id),
      updated_at = NOW();
  `;
}

export async function getClinicAccessByEmail(email: string) {
  const sql = getSql();
  await ensureClinicAccessTable();
  const rows = (await sql`
    SELECT
      email,
      plan_id AS "planId",
      status,
      stripe_customer_id AS "stripeCustomerId",
      stripe_subscription_id AS "stripeSubscriptionId",
      updated_at AS "updatedAt"
    FROM clinic_access
    WHERE email = ${email}
    LIMIT 1;
  `) as unknown as ClinicAccessRow[];
  return rows[0] ?? null;
}

