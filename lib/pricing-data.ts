export type PricingPlan = {
  id: string;
  name: string;
  priceMonthlyUsd: number | null;
  description: string;
  highlights: string[];
  cta: string;
  featured?: boolean;
};

export const CONSUMER_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Explorer",
    priceMonthlyUsd: 0,
    description: "Try Scripti and a limited view of drug summaries.",
    highlights: [
      "Scripti symptom search",
      "Preview of drug side-effect summaries",
      "Help center access",
    ],
    cta: "Choose plan",
  },
  {
    id: "scripti-plus",
    name: "Scripti Plus",
    priceMonthlyUsd: 19,
    description:
      "Unlock partner pharmacy connections and faster next steps after Scripti.",
    highlights: [
      "Partner pharmacy referral links",
      "Rx partner flow (partner may offer prescriber access)",
      "Priority routing for Scripti results",
    ],
    cta: "Choose plan",
  },
  {
    id: "pa-plus",
    name: "Prior auth Plus",
    priceMonthlyUsd: 29,
    description:
      "Auto-fill and optimize prior auth forms, predict approval likelihood, and suggest alternatives.",
    highlights: [
      "Prior auth form optimizer (copy/paste autofill)",
      "Approval likelihood + drivers",
      "Alternative covered drug suggestions",
    ],
    cta: "Choose plan",
    featured: true,
  },
  {
    id: "pro",
    name: "Plus",
    priceMonthlyUsd: 199,
    description:
      "Full prior authorization prediction and drug intelligence for you or your team.",
    highlights: [
      "Prior auth prediction + optimizer",
      "Full drug intelligence search",
      "Priority email support",
    ],
    cta: "Choose plan",
  },
];

export const ORGANIZATION_PLANS: PricingPlan[] = [
  {
    id: "clinic-starter",
    name: "Clinic Starter",
    priceMonthlyUsd: 199,
    description:
      "SaaS for small clinics: PA workflow tools, staff training templates, and predictable per-case fees.",
    highlights: [
      "Prior auth prediction + optimizer for staff",
      "Per prior authorization case fee: $2–$5 (contracted volume)",
      "Email support + onboarding checklist",
    ],
    cta: "Request contract",
  },
  {
    id: "clinic-growth",
    name: "Clinic Growth",
    priceMonthlyUsd: 499,
    description:
      "For growing practices with higher PA volume and more locations.",
    highlights: [
      "Everything in Clinic Starter",
      "Per prior authorization case fee: $3–$7 (volume tier)",
      "Quarterly utilization summary (non-PHI)",
    ],
    cta: "Request contract",
    featured: true,
  },
  {
    id: "clinic-enterprise",
    name: "Clinic Enterprise",
    priceMonthlyUsd: null,
    description:
      "Custom deployment, integrations, and governance for larger clinic groups.",
    highlights: [
      "Dedicated rollout + security review support",
      "Per prior authorization case fee: $5–$10 (enterprise tier)",
      "Custom reporting and agreement-based support hours",
    ],
    cta: "Talk to us",
  },
];

/** Back-compat: combined list for older clients. */
export const PRICING_PLANS: PricingPlan[] = [...CONSUMER_PLANS, ...ORGANIZATION_PLANS];
