import { neon } from "@neondatabase/serverless";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function getSql() {
  // Vercel Neon integration provides one of these. Prefer pooled for serverless.
  const url =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    requireEnv("POSTGRES_URL");
  return neon(url);
}

