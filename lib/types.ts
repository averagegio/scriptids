export type InsuranceType = "commercial" | "medicare" | "medicaid";

export type PriorAuthInput = {
  medication: string;
  indication: string;
  insurance: InsuranceType;
  triedFirstLine: boolean;
  /** Optional details that appear on many PA forms (non-identifying). */
  dose?: string;
  quantity?: string;
  daysSupply?: string;
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
  actionPlan: {
    /** Copy/paste note a consumer can send to the prescriber’s office. */
    messageToPrescriber: string;
    /** Phone script for calling the plan/PBM to confirm requirements. */
    insurerCallScript: string;
    /** Phone script for calling the pharmacy about rejection/next steps. */
    pharmacyCallScript: string;
    /** Short checklist to keep the consumer moving. */
    checklist: string[];
  };
};

export type ClinicPaStatus =
  | "draft"
  | "needs_patient_info"
  | "needs_clinical_info"
  | "ready_to_submit"
  | "submitted"
  | "rfi"
  | "approved"
  | "denied"
  | "closed";

export type ClinicPaTask = {
  id: string;
  label: string;
  done: boolean;
  createdAt: string;
  doneAt?: string;
};

export type ClinicPaCase = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ClinicPaStatus;
  /** Not PHI: internal label for staff, e.g. "Ozempic PA - Dr. Smith" */
  title: string;
  /** Internal owner/assignee label (e.g. staff email/initials). */
  owner?: string;
  medication: string;
  dose?: string;
  quantity?: string;
  daysSupply?: string;
  indication?: string;
  insuranceType: InsuranceType;
  payerOrPbm?: string;
  urgency: "standard" | "expedited";
  /** Free-text internal notes; should not contain patient identifiers. */
  notes?: string;
  tasks: ClinicPaTask[];
  /** Workflow timestamps used for SLA and reporting. */
  submittedAt?: string;
  lastPayerTouchAt?: string;
  determinationAt?: string;
  closedAt?: string;
  /** For approved cases (or internal reference). */
  authorizationNumber?: string;
  /** For denied cases. */
  denialReason?: string;
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
