import { getSql } from "@/lib/db";

export type UserProfile = {
  email: string;
  name: string | null;
  createdAt: string;
  lastLoginAt: string;
};

export async function ensureUserProfilesTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      email TEXT PRIMARY KEY,
      name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export async function upsertUserProfile(params: {
  email: string;
  name?: string;
}) {
  const sql = getSql();
  await ensureUserProfilesTable();
  const name = typeof params.name === "string" ? params.name.trim() : "";
  await sql`
    INSERT INTO user_profiles (email, name, last_login_at)
    VALUES (${params.email}, ${name || null}, NOW())
    ON CONFLICT (email)
    DO UPDATE SET
      last_login_at = NOW(),
      name = CASE
        WHEN COALESCE(user_profiles.name, '') = '' AND EXCLUDED.name IS NOT NULL THEN EXCLUDED.name
        ELSE user_profiles.name
      END;
  `;
}

export async function getUserProfileByEmail(email: string) {
  const sql = getSql();
  await ensureUserProfilesTable();
  const rows = (await sql`
    SELECT
      email,
      name,
      created_at AS "createdAt",
      last_login_at AS "lastLoginAt"
    FROM user_profiles
    WHERE email = ${email}
    LIMIT 1;
  `) as unknown as UserProfile[];
  return rows[0] ?? null;
}

