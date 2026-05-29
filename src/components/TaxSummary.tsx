import { TrendingDown, Euro, PiggyBank, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { TaxResult } from "@/types/tax";
import { ACTIVITY_LABELS } from "@/types/tax";

interface TaxSummaryProps {
  result: TaxResult;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  colorClass = "text-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="rounded-md bg-muted p-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function TaxSummary({ result }: TaxSummaryProps) {
  const {
    revenue,
    activityCategory,
    cotisationsSociales,
    impotRevenu,
    vat,
    totalCharges,
    netIncome,
    effectiveRate,
    thresholdWarnings,
  } = result;

  const dangerWarnings = thresholdWarnings.filter(
    (w) => w.type === "vat_threshold_high" || w.percentage >= 100
  );
  const cautionWarnings = thresholdWarnings.filter(
    (w) => w.type !== "vat_threshold_high" && w.percentage < 100
  );

  return (
    <div className="space-y-4">
      {/* Alertes seuils */}
      {dangerWarnings.map((w, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{w.message}</p>
        </div>
      ))}
      {cautionWarnings.map((w, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-yellow-500/50 bg-yellow-50 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">{w.message}</p>
        </div>
      ))}

      {/* Résumé principal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Récapitulatif</CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {ACTIVITY_LABELS[activityCategory]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard
              icon={Euro}
              label="Chiffre d'affaires"
              value={formatCurrency(revenue)}
              sub="Base de calcul"
            />
            <StatCard
              icon={TrendingDown}
              label="Total des charges"
              value={formatCurrency(totalCharges)}
              sub={`Taux effectif : ${effectiveRate.toFixed(1)}%`}
              colorClass="text-destructive"
            />
            <StatCard
              icon={PiggyBank}
              label="Revenu net estimé"
              value={formatCurrency(netIncome)}
              sub="Après toutes les charges"
              colorClass="text-green-600"
            />
            <StatCard
              icon={CheckCircle}
              label="Taux de charges"
              value={formatPercent(effectiveRate)}
              sub="Sur votre chiffre d'affaires"
            />
          </div>

          <Separator />

          {/* Détail des charges */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Détail des charges</h3>

            <div className="space-y-1.5">
              <LineItem
                label="Cotisations sociales"
                amount={cotisationsSociales.amount}
                detail={`${cotisationsSociales.rate}% du CA${cotisationsSociales.acreRate !== undefined ? ` (ACRE : ${cotisationsSociales.acreRate.toFixed(1)}%)` : ""}`}
              />
              <LineItem
                label={
                  impotRevenu.method === "versement_liberatoire"
                    ? "Impôt (versement libératoire)"
                    : "Impôt sur le revenu (estimé)"
                }
                amount={impotRevenu.amount}
                detail={
                  impotRevenu.method === "versement_liberatoire"
                    ? `${impotRevenu.rate}% du CA`
                    : impotRevenu.taxableIncome !== undefined
                    ? `Base imposable : ${formatCurrency(impotRevenu.taxableIncome)}`
                    : undefined
                }
              />
              {!vat.isExempt && (
                <LineItem
                  label="TVA nette à reverser"
                  amount={vat.vatDue}
                  detail={`Collectée ${formatCurrency(vat.vatCollected)} − Déductible ${formatCurrency(vat.vatDeductible)}`}
                />
              )}

              <Separator className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span className="text-sm">Total charges</span>
                <span className="text-destructive">{formatCurrency(totalCharges)}</span>
              </div>
            </div>
          </div>

          {/* Mention franchise TVA */}
          {vat.isExempt && (
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <strong>Franchise en base TVA :</strong> vous ne facturez pas la TVA et n'en récupérez
              pas sur vos achats. Seuils : {vat.thresholdBase.toLocaleString("fr-FR")} € (base) /
              {" "}{vat.thresholdHigh.toLocaleString("fr-FR")} € (majoré).
            </div>
          )}

          {impotRevenu.method === "bareme_progressif" && (
            <p className="text-xs text-muted-foreground">
              * L'impôt sur le revenu est une estimation basée sur votre seul revenu
              d'auto-entrepreneur. D'autres revenus du foyer peuvent modifier ce montant.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LineItem({
  label,
  amount,
  detail,
}: {
  label: string;
  amount: number;
  detail?: string;
}) {
  return (
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1">
        <span className="text-sm">{label}</span>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
      <span className="text-sm font-medium shrink-0 text-destructive">
        −{formatCurrency(amount)}
      </span>
    </div>
  );
}
