import type {
  InsuranceType,
  PriorAuthInput,
  PriorAuthOptimization,
  PriorAuthAlternative,
} from "./types";

const GLP1 = /ozempic|wegovy|rybelsus|semaglutide|mounjaro|zepbound|tirzepatide/i;
const ANTI_TNF = /humira|adalimumab|infliximab|remicade|enbrel|etanercept/i;
const IL23 = /skyrizi|risankizumab|tremfya|guselkumab/i;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function baseLikelihood(input: PriorAuthInput) {
  const med = input.medication.trim();
  const ind = input.indication.trim();
  let likelihood = 55;
  const drivers: string[] = [];

  if (!med) {
    return { likelihood: 0, drivers: ["Add the medication name to estimate approval."] };
  }

  if (GLP1.test(med)) {
    likelihood -= 10;
    drivers.push("GLP‑1 medicines often require step therapy or specific criteria.");
    if (/diabetes|type 2|t2d/i.test(ind)) {
      likelihood += 8;
      drivers.push("Indication aligns with a common coverage pathway (Type 2 diabetes).");
    }
    if (/weight|obesity|bmi/i.test(ind)) {
      likelihood -= 3;
      drivers.push("Weight-loss indications sometimes have additional plan restrictions.");
    }
  }

  if (ANTI_TNF.test(med) || IL23.test(med)) {
    likelihood -= 6;
    drivers.push("Specialty immunology drugs often require documentation and prior therapies.");
  }

  if (!input.triedFirstLine) {
    likelihood -= 12;
    drivers.push("Plans often want evidence of prior therapies (step therapy) first.");
  } else {
    likelihood += 6;
    drivers.push("Having prior-therapy history usually improves approval odds.");
  }

  if (input.insurance === "medicaid") {
    likelihood -= 4;
    drivers.push("Medicaid plans frequently require specific forms and criteria.");
  }
  if (input.insurance === "medicare") {
    likelihood -= 2;
    drivers.push("Medicare coverage rules can be strict and vary by plan.");
  }

  return { likelihood: clamp(likelihood, 5, 92), drivers };
}

function alternativesFor(medication: string, insurance: InsuranceType): PriorAuthAlternative[] {
  const med = medication.trim();
  const alts: PriorAuthAlternative[] = [];

  const push = (a: PriorAuthAlternative) => alts.push(a);

  if (GLP1.test(med)) {
    push({
      name: "Metformin (generic)",
      type: "generic",
      whyItMayHelp: "Often a first-line diabetes option that many plans cover with fewer restrictions.",
      questionsToAsk: [
        "Is metformin required as step therapy for my plan?",
        "If I’ve tried it before, can my prescriber document intolerance or failure?",
      ],
    });
    push({
      name: "Liraglutide (Victoza/Saxenda)",
      type: "therapeutic-alternative",
      whyItMayHelp: "A related GLP‑1 option that some formularies prefer over others.",
      questionsToAsk: [
        "Is liraglutide preferred on my formulary compared with semaglutide?",
        "If not covered, what preferred GLP‑1 options are listed?",
      ],
    });
    push({
      name: "Dulaglutide (Trulicity)",
      type: "therapeutic-alternative",
      whyItMayHelp: "Another GLP‑1 option that may be preferred depending on the plan.",
      questionsToAsk: [
        "Is Trulicity preferred for my insurance type?",
        "What clinical criteria does my plan require for GLP‑1 coverage?",
      ],
    });
  } else if (ANTI_TNF.test(med)) {
    push({
      name: "Adalimumab biosimilars",
      type: "biosimilar",
      whyItMayHelp: "Many formularies prefer biosimilars due to lower cost with similar intent of therapy.",
      questionsToAsk: [
        "Does my plan prefer a specific adalimumab biosimilar?",
        "Can my prescriber switch to the preferred product to avoid delays?",
      ],
    });
    push({
      name: "Infliximab biosimilars",
      type: "biosimilar",
      whyItMayHelp: "Some plans prefer infused anti‑TNF options with specific site-of-care rules.",
      questionsToAsk: [
        "Is infliximab a covered alternative for my condition on this plan?",
        "Are there site‑of‑care requirements that change coverage?",
      ],
    });
  } else if (IL23.test(med)) {
    push({
      name: "Guselkumab (Tremfya)",
      type: "therapeutic-alternative",
      whyItMayHelp: "A same-class alternative that may be preferred on some formularies.",
      questionsToAsk: [
        "Is Tremfya preferred vs Skyrizi on my plan?",
        "If a different IL‑23 is preferred, can the prescription be switched?",
      ],
    });
  } else {
    push({
      name: "Formulary-preferred generic option",
      type: "generic",
      whyItMayHelp: "Generics are often covered with fewer restrictions when clinically appropriate.",
      questionsToAsk: [
        "Is there a preferred generic for my condition on the formulary?",
        "What documentation does the plan need if the brand is medically necessary?",
      ],
    });
  }

  // Light insurance-specific nudge (still generic).
  if (insurance === "medicaid") {
    alts.forEach((a) => {
      a.questionsToAsk.unshift("Is there a state Medicaid preferred drug list (PDL) requirement here?");
    });
  }

  return alts.slice(0, 3);
}

export function optimizePriorAuth(input: PriorAuthInput): PriorAuthOptimization {
  const { likelihood, drivers } = baseLikelihood(input);

  const medication = input.medication.trim();
  const indication = input.indication.trim();
  const dx = indication || "Diagnosis (add the condition your prescriber is treating)";

  const clinicalRationale = [
    `Requesting coverage for ${medication || "this medication"} for ${dx}.`,
    input.triedFirstLine
      ? "Patient has tried first-line / preferred alternatives when appropriate (document dates, outcomes, or intolerance)."
      : "If step therapy is required, document prior therapies or why first-line options are not appropriate.",
    "Request is medically necessary based on symptoms/diagnosis, prior therapy history, and clinical judgment.",
    "Please advise if additional documentation is required for this plan’s criteria.",
  ].join(" ");

  return {
    approvalLikelihoodPct: likelihood,
    drivers,
    autofill: {
      clinicalRationale,
      documentationChecklist: [
        "Diagnosis and relevant visit notes",
        "Prior therapy history (drug, dates, response, intolerance)",
        "Recent labs/imaging if applicable to the condition",
        "Medication list and allergies",
      ],
      fields: {
        diagnosis: dx,
        priorTherapiesTried: input.triedFirstLine
          ? "List prior therapies tried (names, dates, response)."
          : "Explain why preferred/first-line therapies were not used (contraindication, intolerance, urgency).",
        contraindicationsOrFailures: "Any contraindications, adverse reactions, or treatment failures relevant to this request.",
        requestedDrugAndDose: `${medication || "Medication"} — dose/frequency per prescription.`,
      },
    },
    alternatives: alternativesFor(medication, input.insurance),
  };
}

