export function parseEmailFromSessionToken(token: string | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const encodedEmail = parts[1] ?? "";
  try {
    const email = decodeURIComponent(encodedEmail);
    if (!email.includes("@")) return null;
    return email;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const m = /^Bearer\s+(.+)\s*$/i.exec(h);
  return m?.[1] ?? null;
}

