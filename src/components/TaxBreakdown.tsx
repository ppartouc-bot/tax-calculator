import { formatCurrency } from "@/lib/utils";
import { TAX_RATES_2026, type ActivityCategory } from "@/types/tax";

interface TaxBreakdownProps {
  activityCategory: ActivityCategory;
  revenue: number;
}

const COVERAGE_ITEMS = [
  "Maladie-maternité",
  "Retraite de base",
  "Retraite complémentaire",
  "Alloc. familiales",
  "Invalidité-décès",
  "CSG/CRDS",
] as const;

function RateCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded p-3 space-y-1"
      style={{ background: "hsl(222 20% 13%)", border: "1px solid hsl(220 18% 16%)" }}
    >
      <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "hsl(215 10% 38%)" }}>
        {label}
      </p>
      <p className="font-display text-xl leading-none" style={{ color: "hsl(40 100% 60%)" }}>
        {value}
      </p>
    </div>
  );
}

export function TaxBreakdown({ activityCategory, revenue }: TaxBreakdownProps) {
  const cotisRate = TAX_RATES_2026.cotisations[activityCategory];
  const vlRate = TAX_RATES_2026.versementLiberatoire[activityCategory];
  const abatRate = TAX_RATES_2026.abattementForfaitaire[activityCategory];
  const caLimit = TAX_RATES_2026.caThresholds[activityCategory];
  const cotisAmount = (revenue * cotisRate) / 100;
  const vlAmount = (revenue * vlRate) / 100;
  const baseImposable = Math.max(revenue * (1 - abatRate / 100), 305);

  return (
    <div
      className="rounded-lg border card-ambient"
      style={{ background: "hsl(220 18% 17%)", borderColor: "hsl(220 18% 18%)" }}
    >
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid hsl(220 18% 15%)" }}
      >
        <span className="font-display text-xl tracking-wider" style={{ color: "hsl(40 100% 60%)" }}>
          Référence fiscale
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Cotisations sociales ── */}
        <section className="space-y-3">
          <div className="divider-label">Cotisations sociales</div>
          <div className="grid grid-cols-3 gap-2">
            <RateCell label="Taux" value={`${cotisRate}%`} />
            <RateCell label="/ mois" value={revenue > 0 ? `${(cotisAmount / 12 / 1000).toFixed(1)}k` : "—"} />
            <RateCell label="/ trim." value={revenue > 0 ? `${(cotisAmount / 4 / 1000).toFixed(1)}k` : "—"} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COVERAGE_ITEMS.map((item) => (
              <span
                key={item}
                className="font-mono text-[9px] tracking-wider px-2 py-1 rounded"
                style={{
                  background: "hsla(222, 40%, 8%, 1)",
                  color: "hsl(215 10% 45%)",
                  border: "1px solid hsl(222 22% 14%)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── IR ── */}
        <section className="space-y-3">
          <div className="divider-label">Impôt sur le revenu</div>
          <div className="grid grid-cols-2 gap-2">
            <div
              className="rounded p-3 space-y-1.5"
              style={{ background: "hsl(222 20% 13%)", border: "1px solid hsl(220 18% 16%)" }}
            >
              <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "hsl(215 10% 38%)" }}>
                Barème progressif
              </p>
              <p className="font-mono text-xs" style={{ color: "hsl(215 18% 72%)" }}>
                Abatt. <span style={{ color: "hsl(40 100% 60%)" }}>{abatRate}%</span>
              </p>
              {revenue > 0 && (
                <p className="font-mono text-[10px]" style={{ color: "hsl(215 10% 45%)" }}>
                  Base : {formatCurrency(baseImposable)}
                </p>
              )}
              <p className="font-mono text-[9px]" style={{ color: "hsl(215 10% 38%)" }}>
                Tranches 0% → 45%
              </p>
            </div>
            <div
              className="rounded p-3 space-y-1.5"
              style={{ background: "hsl(222 20% 13%)", border: "1px solid hsl(220 18% 16%)" }}
            >
              <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "hsl(215 10% 38%)" }}>
                Versement libératoire
              </p>
              <p className="font-mono text-xs" style={{ color: "hsl(215 18% 72%)" }}>
                Fixe <span style={{ color: "hsl(40 100% 60%)" }}>{vlRate}%</span>
              </p>
              {revenue > 0 && (
                <p className="font-mono text-[10px]" style={{ color: "hsl(215 10% 45%)" }}>
                  {formatCurrency(vlAmount)} / an
                </p>
              )}
              <p className="font-mono text-[9px]" style={{ color: "hsl(215 10% 38%)" }}>
                Payé avec cotisations
              </p>
            </div>
          </div>
        </section>

        {/* ── Plafond & périodicité ── */}
        <section className="space-y-2">
          <div className="divider-label">Plafonds & déclarations</div>
          <div className="space-y-1">
            {[
              ["Plafond CA annuel", `${caLimit.toLocaleString("fr-FR")} €`],
              ["CA moyen / trimestre", revenue > 0 ? formatCurrency(revenue / 4) : "—"],
              ["CA moyen / mois", revenue > 0 ? formatCurrency(revenue / 12) : "—"],
              ["Déclaration URSSAF", "Mensuelle ou trimestrielle"],
              ["Déclaration impôts", "Annuelle — formulaire 2042-C-PRO"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center py-1.5"
                style={{ borderBottom: "1px solid hsl(220 18% 15%)" }}
              >
                <span className="font-mono text-[10px]" style={{ color: "hsl(215 10% 45%)" }}>
                  {label}
                </span>
                <span className="font-mono text-[10px] font-bold" style={{ color: "hsl(215 18% 72%)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sources ── */}
        <p className="font-mono text-[9px] tracking-wide" style={{ color: "hsl(215 10% 32%)" }}>
          Sources : URSSAF · impots.gouv.fr · service-public.fr — Indicatif, ne remplace pas un conseil comptable.
        </p>
      </div>
    </div>
  );
}
