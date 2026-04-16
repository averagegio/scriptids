export type PriorAuthTemplateId = "universal" | "glp1" | "specialty_biologic";

export type PriorAuthTemplate = {
  id: PriorAuthTemplateId;
  name: string;
  description: string;
  checklist: string[];
};

export const PRIOR_AUTH_TEMPLATES: PriorAuthTemplate[] = [
  {
    id: "universal",
    name: "Universal prior auth",
    description: "A general-purpose checklist and wording that works across many medications.",
    checklist: [
      "Diagnosis / reason for therapy",
      "Medication name, dose, frequency, quantity, days supply",
      "Prior therapies tried (names, dates, response) or why not appropriate",
      "Contraindications, intolerances, or failures",
      "Recent labs/imaging if your plan commonly asks for them",
    ],
  },
  {
    id: "glp1",
    name: "GLP‑1 medications",
    description: "Extra prompts common for GLP‑1 coverage pathways (step therapy, labs, BMI/A1c when applicable).",
    checklist: [
      "Confirm indication (Type 2 diabetes vs weight management pathway)",
      "Document prior metformin / first-line options when clinically appropriate",
      "A1c trend (if diabetes pathway) or relevant weight-management criteria if applicable",
      "Any intolerance/adverse effects from prior therapies",
      "Pharmacy rejection screenshot (if available) with date",
    ],
  },
  {
    id: "specialty_biologic",
    name: "Specialty biologics",
    description: "Helpful documentation patterns for specialty immunology medications.",
    checklist: [
      "Diagnosis severity and duration",
      "Prior biologic / conventional DMARD history (if applicable)",
      "Infection screening / contraindications as required by your plan",
      "Site-of-care notes if infusion-related",
      "Peer-to-peer readiness (if your plan requests it)",
    ],
  },
];
