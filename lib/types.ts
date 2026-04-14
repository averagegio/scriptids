export type InsuranceType = "commercial" | "medicare" | "medicaid";

export type PriorAuthInput = {
  medication: string;
  indication: string;
  insurance: InsuranceType;
  triedFirstLine: boolean;
};

export type PriorAuthPrediction = {
  paLikely: boolean;
  confidencePct: number;
  summary: string;
  expectedDocuments: string[];
  estimatedTurnaroundDays: { min: number; max: number };
  nextSteps: string[];
};

export type PriorAuthFormAutofill = {
  /** Plain-language summary suitable for the "clinical rationale" box. */
  clinicalRationale: string;
  /** Documentation checklist tailored to the situation. */
  documentationChecklist: string[];
  /** Fields that are commonly requested on plan/UM forms. */
  fields: {
    diagnosis?: string;
    priorTherapiesTried?: string;
    contraindicationsOrFailures?: string;
    requestedDrugAndDose?: string;
  };
};

export type PriorAuthAlternative = {
  name: string;
  type: "generic" | "brand" | "biosimilar" | "therapeutic-alternative";
  whyItMayHelp: string;
  questionsToAsk: string[];
};

export type PriorAuthOptimization = {
  approvalLikelihoodPct: number;
  drivers: string[];
  autofill: PriorAuthFormAutofill;
  alternatives: PriorAuthAlternative[];
};

export type SideEffectSignal = {
  term: string;
  reports: number;
  sharePct: number;
  trend: "up" | "flat" | "down";
};

export type DrugIntelligenceProfile = {
  id: string;
  genericName: string;
  brandNames: string[];
  therapeuticClass: string;
  totalSignals: number;
  lastUpdated: string;
  topSignals: SideEffectSignal[];
  notes: string;
};
