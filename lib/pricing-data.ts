export type PricingPlan = {
  id: string;
  name: string;
  priceMonthlyUsd: number | null;
  description: string;
  highlights: string[];
  cta: string;
  featured?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
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
  {
    id: "enterprise",
    name: "Organization",
    priceMonthlyUsd: null,
    description: "For clinics, plans, and companies that need custom setup and support.",
    highlights: [
      "Private or dedicated environment options",
      "Custom reporting and onboarding",
      "Agreement-based support hours",
    ],
    cta: "Talk to us",
  },
];
