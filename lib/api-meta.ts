/** HATEOAS-style pointers so API clients can route users back to the product home. */
export const API_LINKS = {
  home: "/",
  pricing: "/pricing",
  login: "/login",
  signup: "/signup",
  chat: "/chat",
  priorAuth: "/prior-auth",
  intelligence: "/intelligence",
} as const;

export function withApiLinks<T extends Record<string, unknown>>(body: T) {
  return { ...body, _links: API_LINKS };
}
