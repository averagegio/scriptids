/** Investor pitch metrics for Scriptids (illustrative projections). */

export const FUNDING_GOAL_USD = 2_500_000;

export const MARKET = {
  tam: {
    label: "TAM",
    valueUsd: 48_000_000_000,
    display: "$48B",
    blurb:
      "U.S. digital medication access: prior-auth automation, pharmacy workflows, and consumer Rx education.",
  },
  sam: {
    label: "SAM",
    valueUsd: 6_200_000_000,
    display: "$6.2B",
    blurb:
      "Clinics and consumers adopting SaaS for PA prediction, form automation, and plain-language Scripti guidance.",
  },
  som: {
    label: "SOM",
    valueUsd: 180_000_000,
    display: "$180M",
    blurb:
      "Five-year reachable share via clinic SaaS seats, consumer Plus plans, and partner pharmacy referrals.",
  },
} as const;

export type ProjectionYear = {
  year: number;
  label: string;
  mau: number;
  revenueUsd: number;
  payingUsers: number;
  clinicAccounts: number;
};

export const PROJECTIONS: ProjectionYear[] = [
  {
    year: 1,
    label: "Y1",
    mau: 25_000,
    revenueUsd: 420_000,
    payingUsers: 1_800,
    clinicAccounts: 40,
  },
  {
    year: 2,
    label: "Y2",
    mau: 120_000,
    revenueUsd: 2_100_000,
    payingUsers: 9_500,
    clinicAccounts: 180,
  },
  {
    year: 3,
    label: "Y3",
    mau: 450_000,
    revenueUsd: 8_500_000,
    payingUsers: 38_000,
    clinicAccounts: 620,
  },
  {
    year: 4,
    label: "Y4",
    mau: 900_000,
    revenueUsd: 22_000_000,
    payingUsers: 95_000,
    clinicAccounts: 1_400,
  },
  {
    year: 5,
    label: "Y5",
    mau: 1_500_000,
    revenueUsd: 48_000_000,
    payingUsers: 210_000,
    clinicAccounts: 2_800,
  },
];

export type FundAllocation = {
  id: string;
  label: string;
  pct: number;
  amountUsd: number;
  detail: string;
};

export const FUND_ALLOCATION: FundAllocation[] = [
  {
    id: "product",
    label: "Product & engineering",
    pct: 40,
    amountUsd: 1_000_000,
    detail: "PA optimizer, Scripti quality, clinic dashboard, and core reliability.",
  },
  {
    id: "gtm",
    label: "Go-to-market",
    pct: 25,
    amountUsd: 625_000,
    detail: "Clinic pilots, consumer acquisition, and pharmacy partnership growth.",
  },
  {
    id: "trust",
    label: "Clinical, compliance & security",
    pct: 15,
    amountUsd: 375_000,
    detail: "HIPAA-ready controls, clinical review, and audit readiness.",
  },
  {
    id: "ops",
    label: "Operations & G&A",
    pct: 10,
    amountUsd: 250_000,
    detail: "Support, legal, finance, and infrastructure.",
  },
  {
    id: "reserve",
    label: "Runway reserve",
    pct: 10,
    amountUsd: 250_000,
    detail: "Buffer for hiring lag, model costs, and unexpected compliance work.",
  },
];

export function formatCompactUsd(n: number): string {
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return `$${n}`;
}

export function formatMau(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000)}K`;
  }
  return String(n);
}
