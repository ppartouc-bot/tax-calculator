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
      <div className="min-h-screen">
        {/* ── Header ──────────────────────────────── */}
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className="font-display text-2xl leading-none"
                style={{ color: "hsl(40 100% 50%)" }}
              >
                AE//SIM
              </span>
              <span
                className="hidden sm:block h-4 w-px"
                style={{ background: "hsl(222 22% 18%)" }}
              />
              <span className="hidden sm:block font-mono text-xs text-muted-foreground tracking-widest uppercase">
                France 2026
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:block font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                URSSAF · BAREME IR · TVA
              </span>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                style={{
                  background: "hsla(40,100%,50%,0.08)",
                  border: "1px solid hsla(40,100%,50%,0.2)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "hsl(150 100% 50%)" }}
                />
                <span
                  className="font-mono text-[10px] tracking-widest"
                  style={{ color: "hsl(40 100% 60%)" }}
                >
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main ────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-5">
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

            {/* Colonne droite */}
            <div className="space-y-5">
              {result ? (
                <TaxSummary result={result} />
              ) : (
                <div
                  className="rounded-lg border p-14 text-center card-ambient"
                  style={{ borderColor: "hsl(220 18% 18%)" }}
                >
                  <div
                    className="font-display text-6xl mb-3 leading-none"
                    style={{ color: "hsl(222 22% 20%)" }}
                  >
                    0 €
                  </div>
                  <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
                    Entrez votre CA pour simuler
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

        {/* ── Footer ──────────────────────────────── */}
        <footer className="border-t border-border/40 mt-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
            <p className="font-mono text-[10px] text-center text-muted-foreground tracking-wider">
              SIMULATEUR INDICATIF — TAUX URSSAF & BARÈME FISCAL 2026 — NE CONSTITUE PAS UN CONSEIL FISCAL
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
