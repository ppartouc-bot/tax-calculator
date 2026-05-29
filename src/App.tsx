import { Calculator } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RevenueForm } from "@/components/RevenueForm";
import { PurchaseList } from "@/components/PurchaseList";
import { TaxSummary } from "@/components/TaxSummary";
import { TaxBreakdown } from "@/components/TaxBreakdown";
import { useTaxCalculation } from "@/hooks/useTaxCalculation";

export default function App() {
  const {
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
  } = useTaxCalculation();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">
                Simulateur Auto-Entrepreneur
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calcul des taxes et cotisations — France 2026
              </p>
            </div>
          </div>
        </header>

        {/* Main layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche : saisie */}
            <div className="space-y-6">
              <RevenueForm
                revenue={inputs.revenue}
                activityCategory={inputs.activityCategory}
                hasVersementLiberatoire={inputs.hasVersementLiberatoire}
                hasACRE={inputs.hasACRE}
                isSubjectToVAT={inputs.isSubjectToVAT}
                numberOfParts={inputs.numberOfParts}
                onRevenueChange={updateRevenue}
                onCategoryChange={updateActivityCategory}
                onVersementLiberatoireChange={toggleVersementLiberatoire}
                onACREChange={toggleACRE}
                onVATChange={toggleVAT}
                onNumberOfPartsChange={updateNumberOfParts}
              />
              <PurchaseList
                purchases={inputs.purchases}
                isSubjectToVAT={inputs.isSubjectToVAT}
                onAdd={addPurchase}
                onRemove={removePurchase}
                onUpdate={updatePurchase}
              />
            </div>

            {/* Colonne droite : résultats */}
            <div className="space-y-6">
              {result ? (
                <TaxSummary result={result} />
              ) : (
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    Entrez votre chiffre d'affaires
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Le calcul apparaîtra automatiquement
                  </p>
                </div>
              )}
              <TaxBreakdown
                activityCategory={inputs.activityCategory}
                revenue={inputs.revenue}
              />
            </div>
          </div>
        </main>

        <footer className="border-t bg-white/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <p className="text-xs text-center text-muted-foreground">
              Simulateur indicatif — Taux URSSAF et barème fiscal 2026 — Ne constitue pas un conseil fiscal
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
