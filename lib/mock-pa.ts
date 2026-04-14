import type { PriorAuthInput, PriorAuthPrediction } from "./types";

const SPECIALTY_MARKERS = /humira|ozempic|wegovy|skyrizi|dupixent|entyvio|stelara|cosentyx|ocrevus|kesimpta/i;

export function predictPriorAuth(input: PriorAuthInput): PriorAuthPrediction {
  const med = input.medication.trim();
  const isSpecialty = SPECIALTY_MARKERS.test(med);
  const isMedicaid = input.insurance === "medicaid";
  const isMedicare = input.insurance === "medicare";

  let paLikely = isSpecialty || !input.triedFirstLine;
  let confidencePct = isSpecialty ? 88 : input.triedFirstLine ? 62 : 74;
  if (isMedicaid) {
    paLikely = true;
    confidencePct = Math.min(95, confidencePct + 8);
  }
  if (isMedicare && isSpecialty) {
    confidencePct = Math.min(92, confidencePct + 4);
  }

  const documents = [
    "Prescription that lists the reason you need the drug (diagnosis)",
    "Visit notes that show your diagnosis and what you tried before",
    "Recent lab or imaging results if your plan usually asks for them",
  ];
  if (!input.triedFirstLine) {
    documents.unshift("Notes showing you tried simpler or lower-cost options first");
  }

  const summary = paLikely
    ? `For ${input.insurance} coverage, this kind of medication often needs extra approval from the plan before they will pay. ${isSpecialty ? "Specialty drugs usually get a closer look from the insurer." : "Insurers often want paperwork showing the drug is appropriate for you."}`
    : "With standard first-choice drugs and good documentation, many claims go through without a separate approval—but it is still worth checking your benefits before you go to the pharmacy.";

  const turnaround = paLikely
    ? { min: isMedicaid ? 5 : 2, max: isMedicaid ? 21 : 10 }
    : { min: 0, max: 2 };

  const nextSteps = paLikely
    ? [
        "Call your plan or check their website to confirm what they require for this drug.",
        "Gather the items above so your doctor’s office can send them in if asked.",
        "If you submit paperwork, keep a copy and note when you sent it so you can follow up.",
      ]
    : [
        "Double-check that your pharmacy and plan both show the same coverage details.",
        "If the claim is denied, write down the reason code and ask your doctor or insurer what to do next.",
      ];

  return {
    paLikely,
    confidencePct,
    summary,
    expectedDocuments: documents,
    estimatedTurnaroundDays: turnaround,
    nextSteps,
  };
}
