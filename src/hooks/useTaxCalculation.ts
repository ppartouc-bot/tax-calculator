import { useState, useMemo } from "react";
import type { TaxInputs, TaxResult, Purchase, ActivityCategory } from "@/types/tax";
import { calculateTaxes } from "@/lib/tax-calculator";

const DEFAULT_INPUTS: TaxInputs = {
  revenue: 0,
  activityCategory: "services_bic",
  hasVersementLiberatoire: false,
  hasACRE: false,
  isSubjectToVAT: false,
  purchases: [],
  numberOfParts: 1,
};

export function useTaxCalculation() {
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_INPUTS);

  const result = useMemo<TaxResult | null>(() => {
    if (inputs.revenue <= 0) return null;
    return calculateTaxes(inputs);
  }, [inputs]);

  function updateRevenue(revenue: number) {
    setInputs((prev) => ({ ...prev, revenue }));
  }

  function updateActivityCategory(activityCategory: ActivityCategory) {
    setInputs((prev) => ({ ...prev, activityCategory }));
  }

  function toggleVersementLiberatoire(hasVersementLiberatoire: boolean) {
    setInputs((prev) => ({ ...prev, hasVersementLiberatoire }));
  }

  function toggleACRE(hasACRE: boolean) {
    setInputs((prev) => ({ ...prev, hasACRE }));
  }

  function toggleVAT(isSubjectToVAT: boolean) {
    setInputs((prev) => ({ ...prev, isSubjectToVAT }));
  }

  function updateNumberOfParts(numberOfParts: number) {
    setInputs((prev) => ({ ...prev, numberOfParts }));
  }

  function addPurchase(purchase: Omit<Purchase, "id">) {
    const newPurchase: Purchase = {
      ...purchase,
      id: crypto.randomUUID(),
    };
    setInputs((prev) => ({
      ...prev,
      purchases: [...prev.purchases, newPurchase],
    }));
  }

  function removePurchase(id: string) {
    setInputs((prev) => ({
      ...prev,
      purchases: prev.purchases.filter((p) => p.id !== id),
    }));
  }

  function updatePurchase(id: string, updates: Partial<Omit<Purchase, "id">>) {
    setInputs((prev) => ({
      ...prev,
      purchases: prev.purchases.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  }

  return {
    inputs,
    result,
    updateRevenue,
    updateActivityCategory,
    toggleVersementLiberatoire,
    toggleACRE,
    toggleVAT,
    updateNumberOfParts,
    addPurchase,
    removePurchase,
    updatePurchase,
  };
}
