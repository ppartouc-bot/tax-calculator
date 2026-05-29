import type {
  ActivityCategory,
  CotisationsSociales,
  ImpotRevenu,
  Purchase,
  TaxInputs,
  TaxResult,
  ThresholdWarning,
  VATSummary,
} from "@/types/tax";
import { TAX_RATES_2026 } from "@/types/tax";

function computeCotisationsSociales(
  revenue: number,
  category: ActivityCategory,
  hasACRE: boolean
): CotisationsSociales {
  const fullRate = TAX_RATES_2026.cotisations[category];
  const acreRate = fullRate * (1 - TAX_RATES_2026.acreReductionRate);

  const appliedRate = hasACRE ? acreRate : fullRate;
  return {
    rate: fullRate,
    amount: (revenue * appliedRate) / 100,
    ...(hasACRE && {
      acreRate,
      acreAmount: (revenue * acreRate) / 100,
    }),
  };
}

function computeImpotVersementLiberatoire(
  revenue: number,
  category: ActivityCategory
): ImpotRevenu {
  const rate = TAX_RATES_2026.versementLiberatoire[category];
  return {
    method: "versement_liberatoire",
    rate,
    amount: (revenue * rate) / 100,
  };
}

function computeImpotBareme(
  revenue: number,
  category: ActivityCategory,
  numberOfParts: number
): ImpotRevenu {
  const abatementRate = TAX_RATES_2026.abattementForfaitaire[category];
  const abatement = Math.max((revenue * abatementRate) / 100, 305);
  const taxableIncome = Math.max(revenue - abatement, 0);

  const incomePerPart = taxableIncome / numberOfParts;
  let taxPerPart = 0;

  for (const bracket of TAX_RATES_2026.baremIR) {
    if (incomePerPart <= bracket.min) break;
    const taxableInBracket = Math.min(incomePerPart, bracket.max) - bracket.min;
    taxPerPart += (taxableInBracket * bracket.rate) / 100;
  }

  const totalTax = taxPerPart * numberOfParts;

  return {
    method: "bareme_progressif",
    amount: totalTax,
    abatement,
    taxableIncome,
  };
}

function computeVAT(
  revenue: number,
  category: ActivityCategory,
  isSubjectToVAT: boolean,
  purchases: Purchase[]
): VATSummary {
  const isVente = category === "vente_marchandises";
  const thresholds = isVente
    ? TAX_RATES_2026.vatThresholds.vente
    : TAX_RATES_2026.vatThresholds.services;

  if (!isSubjectToVAT) {
    return {
      isExempt: true,
      thresholdBase: thresholds.base,
      thresholdHigh: thresholds.high,
      vatCollected: 0,
      vatDeductible: 0,
      vatDue: 0,
    };
  }

  // Quand assujetti à la TVA : TVA collectée sur CA HT (CA saisi est HT)
  const vatCollected = revenue * 0.2; // TVA 20% standard sur les ventes
  const vatDeductible = purchases.reduce((sum, p) => {
    return sum + (p.amountHT * p.vatRate) / 100;
  }, 0);

  return {
    isExempt: false,
    thresholdBase: thresholds.base,
    thresholdHigh: thresholds.high,
    vatCollected,
    vatDeductible,
    vatDue: Math.max(vatCollected - vatDeductible, 0),
  };
}

function computeThresholdWarnings(
  revenue: number,
  category: ActivityCategory
): ThresholdWarning[] {
  const warnings: ThresholdWarning[] = [];

  const caLimit = TAX_RATES_2026.caThresholds[category];
  const caPercentage = (revenue / caLimit) * 100;

  if (caPercentage >= 80) {
    warnings.push({
      type: "ca_limit",
      message: `Votre CA représente ${caPercentage.toFixed(0)}% du plafond autorisé (${caLimit.toLocaleString("fr-FR")} €). Au-delà, vous basculez en régime réel.`,
      currentValue: revenue,
      threshold: caLimit,
      percentage: caPercentage,
    });
  }

  const isVente = category === "vente_marchandises";
  const vatBase = isVente
    ? TAX_RATES_2026.vatThresholds.vente.base
    : TAX_RATES_2026.vatThresholds.services.base;
  const vatHigh = isVente
    ? TAX_RATES_2026.vatThresholds.vente.high
    : TAX_RATES_2026.vatThresholds.services.high;

  if (revenue > vatBase) {
    const vatPct = (revenue / vatHigh) * 100;
    warnings.push({
      type: "vat_threshold_base",
      message: `Votre CA dépasse le seuil de franchise TVA de base (${vatBase.toLocaleString("fr-FR")} €). Vous devez facturer la TVA si vous dépassez également ${vatHigh.toLocaleString("fr-FR")} € l'année suivante.`,
      currentValue: revenue,
      threshold: vatBase,
      percentage: vatPct,
    });
  }

  if (revenue > vatHigh) {
    warnings.push({
      type: "vat_threshold_high",
      message: `Votre CA dépasse le seuil majoré TVA (${vatHigh.toLocaleString("fr-FR")} €). Vous êtes obligatoirement assujetti à la TVA dès le 1er jour du mois de dépassement.`,
      currentValue: revenue,
      threshold: vatHigh,
      percentage: 100,
    });
  }

  return warnings;
}

export function calculateTaxes(inputs: TaxInputs): TaxResult {
  const {
    revenue,
    activityCategory,
    hasVersementLiberatoire,
    hasACRE,
    isSubjectToVAT,
    purchases,
    numberOfParts,
  } = inputs;

  const cotisationsSociales = computeCotisationsSociales(
    revenue,
    activityCategory,
    hasACRE
  );

  const impotRevenu = hasVersementLiberatoire
    ? computeImpotVersementLiberatoire(revenue, activityCategory)
    : computeImpotBareme(revenue, activityCategory, numberOfParts);

  const vat = computeVAT(revenue, activityCategory, isSubjectToVAT, purchases);

  const totalCharges =
    cotisationsSociales.amount + impotRevenu.amount + vat.vatDue;

  const netIncome = Math.max(revenue - totalCharges, 0);
  const effectiveRate = revenue > 0 ? (totalCharges / revenue) * 100 : 0;

  const thresholdWarnings = computeThresholdWarnings(revenue, activityCategory);

  return {
    revenue,
    activityCategory,
    cotisationsSociales,
    impotRevenu,
    vat,
    totalCharges,
    netIncome,
    effectiveRate,
    thresholdWarnings,
  };
}
