import type { DrugIntelligenceProfile } from "./types";

export const DRUG_PROFILES: DrugIntelligenceProfile[] = [
  {
    id: "glucagon-peptide-1",
    genericName: "semaglutide",
    brandNames: ["Ozempic", "Wegovy", "Rybelsus"],
    therapeuticClass: "GLP-1 receptor agonist",
    totalSignals: 18420,
    lastUpdated: "2026-04-01",
    topSignals: [
      { term: "nausea", reports: 4120, sharePct: 22, trend: "flat" },
      { term: "gastrointestinal disorder", reports: 2890, sharePct: 16, trend: "up" },
      { term: "gallbladder disorder", reports: 910, sharePct: 5, trend: "up" },
      { term: "pancreatitis", reports: 620, sharePct: 3, trend: "flat" },
    ],
    notes:
      "These counts come from grouped, non-identifiable reports. They are not a full picture of every person’s experience and they do not replace the official drug label or your clinician’s advice.",
  },
  {
    id: "il23-inhibitor",
    genericName: "risankizumab",
    brandNames: ["Skyrizi"],
    therapeuticClass: "IL-23 inhibitor (immunology)",
    totalSignals: 3210,
    lastUpdated: "2026-03-28",
    topSignals: [
      { term: "upper respiratory infection", reports: 540, sharePct: 17, trend: "flat" },
      { term: "injection site reaction", reports: 410, sharePct: 13, trend: "down" },
      { term: "headache", reports: 380, sharePct: 12, trend: "flat" },
      { term: "fatigue", reports: 290, sharePct: 9, trend: "up" },
    ],
    notes:
      "Trends reflect what shows up often in this summary set. Your own risks and benefits depend on your health history—discuss with your prescriber.",
  },
  {
    id: "jak-inhibitor",
    genericName: "upadacitinib",
    brandNames: ["Rinvoq"],
    therapeuticClass: "JAK inhibitor",
    totalSignals: 4980,
    lastUpdated: "2026-03-30",
    topSignals: [
      { term: "upper respiratory infection", reports: 720, sharePct: 14, trend: "flat" },
      { term: "blood creatinine increased", reports: 510, sharePct: 10, trend: "up" },
      { term: "lipid increase", reports: 440, sharePct: 9, trend: "up" },
      { term: "herpes zoster", reports: 380, sharePct: 8, trend: "flat" },
    ],
    notes:
      "Similar medicines can share side-effect patterns; use this view as background reading, not a personal safety check.",
  },
];

function normalizeSearchText(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchDrugProfiles(query: string): DrugIntelligenceProfile[] {
  const q = normalizeSearchText(query);
  if (!q) return DRUG_PROFILES;

  const tokens = q.split(" ").filter(Boolean);
  const score = (d: DrugIntelligenceProfile) => {
    const generic = normalizeSearchText(d.genericName);
    const klass = normalizeSearchText(d.therapeuticClass);
    const brands = d.brandNames.map(normalizeSearchText);
    const haystack = [generic, ...brands, klass].join(" ");

    // Require that every token appears somewhere (keeps results relevant).
    if (!tokens.every((t) => haystack.includes(t))) return -1;

    // Rank: exact generic match > brand match > partial matches.
    let s = 0;
    if (generic === q) s += 50;
    if (brands.includes(q)) s += 40;
    if (generic.includes(q)) s += 20;
    if (brands.some((b) => b.includes(q))) s += 15;
    if (klass.includes(q)) s += 5;
    // Tie-break: more report volume slightly higher.
    s += Math.min(10, Math.floor(d.totalSignals / 2000));
    return s;
  };

  return [...DRUG_PROFILES]
    .map((d) => ({ d, s: score(d) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.d);
}
