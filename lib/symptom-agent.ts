/**
 * Demo-only: pattern match on free text. Not a medical device.
 * Production should use clinician-in-the-loop workflows and regulated pathways.
 */

export type MedicationClassSuggestion = {
  label: string;
  examples: string[];
  otc?: boolean;
  note?: string;
};

export type SymptomMatch = {
  matchedTerms: string[];
  context: string;
  suggestions: MedicationClassSuggestion[];
};

export type ScriptiIntent =
  | "otc"
  | "prescription"
  | "prior_auth"
  | "insurance_cost"
  | "side_effects"
  | "emergency";

export type ScriptiAgentMeta = {
  intents: ScriptiIntent[];
  matchedKeywords: string[];
  recommendedTools: { label: string; href: string; why: string }[];
  safety: { urgent: boolean; message?: string };
};

const RULES: {
  terms: string[];
  context: string;
  suggestions: MedicationClassSuggestion[];
}[] = [
  {
    terms: ["headache", "migraine", "head pain"],
    context: "tension-type or mild headache",
    suggestions: [
      {
        label: "Analgesics (OTC)",
        examples: ["acetaminophen", "ibuprofen", "naproxen (short-term)"],
        otc: true,
        note: "Avoid NSAIDs if your clinician advised against them (e.g., certain kidney, bleeding, or GI risks).",
      },
    ],
  },
  {
    terms: ["fever", "chills", "temperature"],
    context: "feverish illness",
    suggestions: [
      {
        label: "Antipyretics / comfort care (OTC)",
        examples: ["acetaminophen", "ibuprofen"],
        otc: true,
        note: "Seek urgent care for high fever with stiff neck, confusion, rash, or trouble breathing.",
      },
    ],
  },
  {
    terms: ["allergy", "allergic", "sneeze", "sneezing", "hay fever", "hives", "itchy eyes", "runny nose"],
    context: "allergic rhinitis or mild allergic symptoms",
    suggestions: [
      {
        label: "Second-generation antihistamines (OTC/Rx)",
        examples: ["cetirizine", "loratadine", "fexofenadine"],
        otc: true,
      },
      {
        label: "Intranasal corticosteroids (often OTC/Rx)",
        examples: ["fluticasone nasal", "triamcinolone nasal"],
        otc: true,
        note: "Epinephrine is appropriate for anaphylaxis—this chat cannot triage emergencies.",
      },
    ],
  },
  {
    terms: ["cough", "coughing"],
    context: "cough (cause varies)",
    suggestions: [
      {
        label: "Symptom-directed OTC options",
        examples: ["dextromethorphan (dry cough)", "guaifenesin (wet cough)"],
        otc: true,
        note: "Persistent cough, blood in sputum, weight loss, or fever warrants in-person evaluation.",
      },
    ],
  },
  {
    terms: ["heartburn", "reflux", "gerd", "indigestion", "acid"],
    context: "dyspepsia / reflux-type symptoms",
    suggestions: [
      {
        label: "Acid suppression (OTC/Rx)",
        examples: ["famotidine", "omeprazole (short courses OTC in some regions)"],
        otc: true,
        note: "Alarm symptoms (difficulty swallowing, vomiting blood, black stools) need urgent care.",
      },
    ],
  },
  {
    terms: ["nausea", "vomiting", "queasy"],
    context: "nausea / vomiting",
    suggestions: [
      {
        label: "Antiemetics (often Rx)",
        examples: ["ondansetron", "metoclopramide", "prochlorperazine"],
        note: "Many antiemetics are prescription-only and require diagnosis of cause (pregnancy, infection, etc.).",
      },
      {
        label: "OTC ginger / meclizine (motion sickness)",
        examples: ["meclizine", "dimenhydrinate"],
        otc: true,
      },
    ],
  },
  {
    terms: ["rash", "dermatitis", "eczema", "skin itch"],
    context: "skin inflammation or itch",
    suggestions: [
      {
        label: "Topical therapies (OTC mild)",
        examples: ["hydrocortisone 1% cream", "petrolatum barrier creams"],
        otc: true,
        note: "Spreading painful rash, blistering, or facial swelling needs urgent evaluation.",
      },
    ],
  },
  {
    terms: ["diarrhea", "loose stool"],
    context: "acute diarrhea",
    suggestions: [
      {
        label: "Supportive / OTC antidiarrheal",
        examples: ["oral rehydration", "loperamide (short-term, not if fever/bloody stool)"],
        otc: true,
        note: "Bloody stool, high fever, or severe dehydration—seek medical care.",
      },
    ],
  },
  {
    terms: ["constipation", "constipated"],
    context: "constipation",
    suggestions: [
      {
        label: "Osmotic / stimulant laxatives (OTC)",
        examples: ["polyethylene glycol", "senna", "bisacodyl"],
        otc: true,
        note: "New bowel habit change in adults over 50 or with alarm symptoms should be evaluated.",
      },
    ],
  },
  {
    terms: ["insomnia", "can't sleep", "cant sleep", "sleepless"],
    context: "sleep difficulty",
    suggestions: [
      {
        label: "Sleep hygiene first-line; cautious OTC",
        examples: ["melatonin (variable evidence)", "diphenhydramine (sedating antihistamine—avoid long-term)"],
        otc: true,
        note: "Chronic insomnia or mental health symptoms deserve clinician discussion (CBT-I, Rx options).",
      },
    ],
  },
  {
    terms: ["anxiety", "panic", "worried", "stress"],
    context: "anxiety or stress symptoms",
    suggestions: [
      {
        label: "Non-drug and professional pathways",
        examples: ["therapy (CBT)", "breathing techniques", "discuss SSRIs/SNRIs or other Rx with a prescriber"],
        note: "This assistant does not recommend controlled substances or replace emergency mental health care.",
      },
    ],
  },
  {
    terms: ["depression", "depressed", "low mood"],
    context: "depressive symptoms",
    suggestions: [
      {
        label: "Clinical evaluation recommended",
        examples: ["SSRIs/SNRIs", "bupropion", "mirtazapine"],
        note: "Medication choice requires diagnosis, monitoring, and safety screening—see a licensed clinician.",
      },
    ],
  },
  {
    terms: ["thirst", "urinate", "urinating often", "frequent urination", "blurry vision", "blurred vision"],
    context: "possible metabolic symptoms",
    suggestions: [
      {
        label: "Medical evaluation before medication",
        examples: ["A1c / glucose testing", "possible metformin or other therapy if diabetes diagnosed"],
        note: "Do not start prescription diabetes drugs without diagnosis and monitoring.",
      },
    ],
  },
];

export function matchSymptoms(userText: string): SymptomMatch | null {
  const lower = userText.toLowerCase();
  const matched: SymptomMatch = {
    matchedTerms: [],
    context: "",
    suggestions: [],
  };
  const seen = new Set<string>();

  for (const rule of RULES) {
    const hit = rule.terms.some((t) => lower.includes(t));
    if (hit) {
      if (!matched.context) matched.context = rule.context;
      for (const t of rule.terms) {
        if (lower.includes(t) && !matched.matchedTerms.includes(t)) {
          matched.matchedTerms.push(t);
        }
      }
      for (const s of rule.suggestions) {
        const key = s.label;
        if (!seen.has(key)) {
          seen.add(key);
          matched.suggestions.push(s);
        }
      }
    }
  }

  if (matched.suggestions.length === 0) return null;
  return matched;
}

const RX_KEYWORDS =
  /\b(prescription|rx|script|prescribed|my doctor|my prescriber|dose|mg|refill|pharmacy)\b/i;
const PA_KEYWORDS =
  /\b(prior authorization|prior auth|pa\b|denied|appeal|step therapy|formulary|coverage criteria|medical necessity)\b/i;
const INSURANCE_KEYWORDS =
  /\b(insurance|copay|co-pay|deductible|out[- ]of[- ]pocket|prior approval|claim|pbm|plan)\b/i;
const SIDE_EFFECT_KEYWORDS =
  /\b(side effect|side-effect|adverse|reaction|nausea|rash|dizzy|dizziness|fatigue|headache)\b/i;
const EMERGENCY_KEYWORDS =
  /\b(chest pain|shortness of breath|trouble breathing|cannot breathe|fainting|passed out|stroke|slurred speech|one-sided|seizure|anaphylaxis|face swelling|throat swelling|suicidal|self-harm)\b/i;

export function analyzeScriptiInput(userText: string): ScriptiAgentMeta {
  const txt = userText.trim();
  const matched: string[] = [];
  const intents = new Set<ScriptiIntent>();

  const add = (intent: ScriptiIntent, keyword: string) => {
    intents.add(intent);
    matched.push(keyword);
  };

  if (EMERGENCY_KEYWORDS.test(txt)) add("emergency", "urgent symptom");
  if (RX_KEYWORDS.test(txt)) add("prescription", "prescription/Rx");
  if (PA_KEYWORDS.test(txt)) add("prior_auth", "prior authorization");
  if (INSURANCE_KEYWORDS.test(txt)) add("insurance_cost", "insurance/cost");
  if (SIDE_EFFECT_KEYWORDS.test(txt)) add("side_effects", "side effects");

  // Default intent: OTC education (what Scripti is safest at).
  intents.add("otc");

  const recommendedTools: ScriptiAgentMeta["recommendedTools"] = [];
  const pushTool = (label: string, href: string, why: string) => {
    if (recommendedTools.some((t) => t.href === href)) return;
    recommendedTools.push({ label, href, why });
  };

  if (intents.has("prior_auth") || intents.has("insurance_cost") || intents.has("prescription")) {
    pushTool(
      "Prior auth prediction",
      "/prior-auth",
      "If insurance coverage might require extra approval or paperwork, this helps you plan what’s usually requested.",
    );
  }
  if (intents.has("side_effects") || intents.has("prescription")) {
    pushTool(
      "Drug intelligence",
      "/intelligence",
      "If you’re comparing side-effect trends for a drug name, this summarizes report patterns for learning.",
    );
  }

  const urgent = intents.has("emergency");
  return {
    intents: [...intents],
    matchedKeywords: [...new Set(matched)],
    recommendedTools,
    safety: urgent
      ? {
          urgent: true,
          message:
            "If you think this could be an emergency, call your local emergency number now. Scriptids can’t triage emergencies.",
        }
      : { urgent: false },
  };
}

export function buildSymptomAssistantReply(userText: string): string {
  const trimmed = userText.trim();
  if (!trimmed) {
    return "Describe your main symptoms in plain language (for example: “seasonal allergies with sneezing” or “heartburn after meals”). I will suggest **drug classes** to discuss with a clinician—not a personal diagnosis or prescription.";
  }

  const agent = analyzeScriptiInput(trimmed);
  const match = matchSymptoms(trimmed);
  const disclaimer =
    "**Not medical advice.** Scriptids cannot diagnose or prescribe. For emergencies, call emergency services. Always confirm safety, interactions, and dosing with a licensed prescriber or pharmacist.";

  if (!match) {
    return (
      `I did not recognize specific symptom keywords in your message. Try naming symptoms directly (e.g., headache, cough, heartburn, rash, nausea, allergies).\n\n` +
      (agent.safety.urgent && agent.safety.message ? `**Urgent:** ${agent.safety.message}\n\n` : "") +
      (agent.recommendedTools.length
        ? `**Helpful tools:**\n${agent.recommendedTools
            .map((t) => `- [${t.label}](${t.href}) — ${t.why}`)
            .join("\n")}\n\n`
        : "") +
      `${disclaimer}`
    );
  }

  const lines: string[] = [];
  if (agent.safety.urgent && agent.safety.message) {
    lines.push(`**Urgent:** ${agent.safety.message}`);
    lines.push("");
  }
  lines.push(
    `From what you shared, I mapped keywords related to **${match.context}** (${match.matchedTerms.slice(0, 5).join(", ")}). Below are **general medication classes** people sometimes discuss with clinicians—this is educational, not individualized care.`,
  );
  lines.push("");
  for (const s of match.suggestions) {
    const otc = s.otc ? " (often available OTC in some regions)" : "";
    lines.push(`- **${s.label}**${otc}: ${s.examples.join(", ")}`);
    if (s.note) lines.push(`  - *Note:* ${s.note}`);
  }
  lines.push("");
  if (agent.recommendedTools.length) {
    lines.push("**Next steps in Scriptids (optional):**");
    for (const t of agent.recommendedTools) {
      lines.push(`- [${t.label}](${t.href}) — ${t.why}`);
    }
  } else {
    lines.push(
      "If you want to explore prescriptions, insurance steps, or side-effect trends, Scriptids has additional tools—these are guides, not personal medical decisions.",
    );
  }
  lines.push("");
  lines.push(disclaimer);
  return lines.join("\n");
}
