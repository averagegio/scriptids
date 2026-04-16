const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthInput(email: unknown, password: unknown) {
  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return { ok: false as const, error: "Valid email required" };
  }
  if (typeof password !== "string" || password.length < 8) {
    return {
      ok: false as const,
      error: "Password must be at least 8 characters",
    };
  }
  return { ok: true as const, email: email.trim().toLowerCase() };
}

/**
 * Lightweight session token for early builds.
 * Replace with signed JWT + httpOnly cookies when you harden auth.
 */
export function makeSessionToken(email: string) {
  const safe = encodeURIComponent(email).slice(0, 120);
  return `sid.${safe}.${Date.now().toString(36)}`;
}
