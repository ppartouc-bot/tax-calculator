// Catégories d'activité pour l'auto-entrepreneur
export type ActivityCategory =
  | "vente_marchandises"       // BIC - achat/revente
  | "services_bic"             // BIC - prestations de services
  | "liberal_bnc"              // BNC - professions libérales (régime général)
  | "liberal_cipav";           // BNC - professions libérales (CIPAV)

export interface Purchase {
  id: string;
  description: string;
  amountHT: number;
  vatRate: number; // 0, 5.5, 10, 20
}

export interface TaxInputs {
  revenue: number;
  activityCategory: ActivityCategory;
  hasVersementLiberatoire: boolean;
  hasACRE: boolean;
  isSubjectToVAT: boolean;
  purchases: Purchase[];
  numberOfParts: number; // quotient familial pour simulation IR
}

export interface CotisationsSociales {
  rate: number;
  amount: number;
  acreRate?: number;
  acreAmount?: number;
}

export interface ImpotRevenu {
  method: "versement_liberatoire" | "bareme_progressif";
  rate?: number;
  amount: number;
  abatement?: number;
  taxableIncome?: number;
}

export interface VATSummary {
  isExempt: boolean;
  thresholdBase: number;
  thresholdHigh: number;
  vatCollected: number;
  vatDeductible: number;
  vatDue: number;
}

export interface TaxResult {
  revenue: number;
  activityCategory: ActivityCategory;
  cotisationsSociales: CotisationsSociales;
  impotRevenu: ImpotRevenu;
  vat: VATSummary;
  totalCharges: number;
  netIncome: number;
  effectiveRate: number;
  thresholdWarnings: ThresholdWarning[];
}

export interface ThresholdWarning {
  type: "ca_limit" | "vat_threshold_base" | "vat_threshold_high";
  message: string;
  currentValue: number;
  threshold: number;
  percentage: number;
}

// Taux 2026 - source: URSSAF, Legifrance
export const TAX_RATES_2026 = {
  cotisations: {
    vente_marchandises: 12.3,
    services_bic: 21.2,
    liberal_bnc: 25.6,
    liberal_cipav: 23.2,
  },
  versementLiberatoire: {
    vente_marchandises: 1.0,
    services_bic: 1.7,
    liberal_bnc: 2.2,
    liberal_cipav: 2.2,
  },
  abattementForfaitaire: {
    vente_marchandises: 71,
    services_bic: 50,
    liberal_bnc: 34,
    liberal_cipav: 34,
  },
  // Taux d'imposition progressif 2025 (revenus 2024, barème 2025)
  baremIR: [
    { min: 0, max: 11497, rate: 0 },
    { min: 11497, max: 29315, rate: 11 },
    { min: 29315, max: 83823, rate: 30 },
    { min: 83823, max: 180294, rate: 41 },
    { min: 180294, max: Infinity, rate: 45 },
  ],
  // Seuils CA 2026 (revenus 2026-2028)
  caThresholds: {
    vente_marchandises: 203_100,
    services_bic: 83_600,
    liberal_bnc: 83_600,
    liberal_cipav: 83_600,
  },
  // Seuils TVA 2026 (inchangés après abandon de la réforme)
  vatThresholds: {
    services: { base: 37_500, high: 41_250 },
    vente: { base: 85_000, high: 93_500 },
  },
  // ACRE : exonération partielle 1ère année
  acreReductionRate: 0.5, // 50% jusqu'au 1er juillet 2026, puis 75%
} as const;

export const ACTIVITY_LABELS: Record<ActivityCategory, string> = {
  vente_marchandises: "Vente de marchandises (BIC)",
  services_bic: "Prestations de services (BIC)",
  liberal_bnc: "Profession libérale - régime général (BNC)",
  liberal_cipav: "Profession libérale - CIPAV (BNC)",
};

export const VAT_RATES = [0, 5.5, 10, 20] as const;
