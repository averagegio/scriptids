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

export function searchDrugProfiles(query: string): DrugIntelligenceProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return DRUG_PROFILES;
  return DRUG_PROFILES.filter(
    (d) =>
      d.genericName.includes(q) ||
      d.therapeuticClass.toLowerCase().includes(q) ||
      d.brandNames.some((b) => b.toLowerCase().includes(q)),
  );
}
