import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TAX_RATES_2026, type ActivityCategory } from "@/types/tax";

interface TaxBreakdownProps {
  activityCategory: ActivityCategory;
  revenue: number;
}

const COVERAGE_ITEMS = [
  "Assurance maladie-maternité",
  "Retraite de base",
  "Retraite complémentaire",
  "Allocations familiales",
  "Invalidité-décès",
  "CSG/CRDS",
] as const;

export function TaxBreakdown({ activityCategory, revenue }: TaxBreakdownProps) {
  const cotisRate = TAX_RATES_2026.cotisations[activityCategory];
  const vlRate = TAX_RATES_2026.versementLiberatoire[activityCategory];
  const abatRate = TAX_RATES_2026.abattementForfaitaire[activityCategory];
  const caLimit = TAX_RATES_2026.caThresholds[activityCategory];

  const quarterlyCA = revenue / 4;
  const monthlyCA = revenue / 12;
  const cotisAmount = (revenue * cotisRate) / 100;
  const vlAmount = (revenue * vlRate) / 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Comprendre vos taxes</CardTitle>
        <CardDescription>
          Détails des taux et couvertures pour votre activité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cotisations sociales */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Cotisations sociales</h3>
            <Badge variant="secondary">{cotisRate}% du CA</Badge>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annuel</span>
              <span className="font-medium">{formatCurrency(cotisAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trimestriel</span>
              <span>{formatCurrency(cotisAmount / 4)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mensuel</span>
              <span>{formatCurrency(cotisAmount / 12)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Couverture sociale
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COVERAGE_ITEMS.map((item) => (
                <span
                  key={item}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded px-2 py-0.5"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Impôt sur le revenu */}
        <section className="space-y-3">
          <h3 className="font-semibold text-sm">Impôt sur le revenu</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Barème progressif</p>
              <p className="text-sm">Abattement <strong>{abatRate}%</strong></p>
              <p className="text-xs text-muted-foreground">
                Base imposable : {formatCurrency(Math.max(revenue * (1 - abatRate / 100), 305))}
              </p>
              <p className="text-xs text-muted-foreground">Tranches 0% → 45%</p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Versement libératoire</p>
              <p className="text-sm">Taux fixe <strong>{vlRate}%</strong></p>
              <p className="text-xs text-muted-foreground">
                Soit : {formatCurrency(vlAmount)} / an
              </p>
              <p className="text-xs text-muted-foreground">Payé avec les cotisations</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Plafonds & périodicité */}
        <section className="space-y-3">
          <h3 className="font-semibold text-sm">Plafonds et déclarations</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plafond CA annuel</span>
              <span className="font-medium">{caLimit.toLocaleString("fr-FR")} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CA moyen / trimestre</span>
              <span>{formatCurrency(quarterlyCA)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CA moyen / mois</span>
              <span>{formatCurrency(monthlyCA)}</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Déclaration URSSAF :</strong> mensuelle ou trimestrielle selon votre choix.
            </p>
            <p>
              <strong>Déclaration impôts :</strong> annuelle, avec déclaration 2042-C-PRO.
            </p>
          </div>
        </section>

        <Separator />

        {/* Sources */}
        <section>
          <p className="text-xs text-muted-foreground">
            Taux 2026 — Sources :{" "}
            <a
              href="https://www.urssaf.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              URSSAF
            </a>
            ,{" "}
            <a
              href="https://www.impots.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              impots.gouv.fr
            </a>
            . Ce simulateur est indicatif et ne remplace pas un conseil comptable.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
