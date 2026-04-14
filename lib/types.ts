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
