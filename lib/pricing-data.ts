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
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Plus",
    priceMonthlyUsd: 199,
    description: "Full PA predictor and deeper drug intelligence for you or your team.",
    highlights: [
      "PA predictor with saved cases",
      "Full drug intelligence search",
      "Priority email support",
    ],
    cta: "Contact sales",
    featured: true,
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
