import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TAX_RATES_2026, ACTIVITY_LABELS, type ActivityCategory } from "@/types/tax";

interface RevenueFormProps {
  revenue: number;
  activityCategory: ActivityCategory;
  hasVersementLiberatoire: boolean;
  hasACRE: boolean;
  isSubjectToVAT: boolean;
  numberOfParts: number;
  onRevenueChange: (value: number) => void;
  onCategoryChange: (value: ActivityCategory) => void;
  onVersementLiberatoireChange: (value: boolean) => void;
  onACREChange: (value: boolean) => void;
  onVATChange: (value: boolean) => void;
  onNumberOfPartsChange: (value: number) => void;
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function RevenueForm({
  revenue,
  activityCategory,
  hasVersementLiberatoire,
  hasACRE,
  isSubjectToVAT,
  numberOfParts,
  onRevenueChange,
  onCategoryChange,
  onVersementLiberatoireChange,
  onACREChange,
  onVATChange,
  onNumberOfPartsChange,
}: RevenueFormProps) {
  const caLimit = TAX_RATES_2026.caThresholds[activityCategory];
  const cotisRate = TAX_RATES_2026.cotisations[activityCategory];
  const vlRate = TAX_RATES_2026.versementLiberatoire[activityCategory];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Votre situation</CardTitle>
        <CardDescription>
          Renseignez votre chiffre d'affaires et votre type d'activité (données 2026)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chiffre d'affaires */}
        <div className="space-y-2">
          <Label htmlFor="revenue" className="flex items-center">
            Chiffre d'affaires annuel (€ HT)
            <InfoTooltip content="Montant total facturé hors taxes sur l'année. Pour les micro-entreprises en franchise de TVA, c'est votre CA brut." />
          </Label>
          <div className="relative">
            <Input
              id="revenue"
              type="number"
              min="0"
              max={caLimit}
              step="100"
              placeholder="Ex : 30 000"
              value={revenue || ""}
              onChange={(e) => onRevenueChange(Number(e.target.value))}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              €
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Plafond auto-entrepreneur : {caLimit.toLocaleString("fr-FR")} €
          </p>
        </div>

        {/* Catégorie d'activité */}
        <div className="space-y-2">
          <Label className="flex items-center">
            Catégorie d'activité
            <InfoTooltip content="Détermine vos taux de cotisations sociales, d'abattement fiscal et vos plafonds de CA." />
          </Label>
          <Select
            value={activityCategory}
            onValueChange={(v) => onCategoryChange(v as ActivityCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ACTIVITY_LABELS) as [ActivityCategory, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Cotisations sociales : {cotisRate}% — Versement libératoire : {vlRate}%
          </p>
        </div>

        {/* Options fiscales */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Options fiscales</h3>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center cursor-pointer">
                Versement libératoire de l'impôt
                <InfoTooltip content={`Option permettant de payer l'impôt sur le revenu en même temps que les cotisations sociales. Taux : ${vlRate}% du CA. Avantageuse si votre tranche d'imposition est élevée.`} />
              </Label>
              <p className="text-xs text-muted-foreground">
                Taux : {vlRate}% du CA (au lieu du barème progressif)
              </p>
            </div>
            <Switch
              checked={hasVersementLiberatoire}
              onCheckedChange={onVersementLiberatoireChange}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center cursor-pointer">
                Bénéficiaire de l'ACRE
                <InfoTooltip content="Aide à la Création et Reprise d'Entreprise : exonération de 50% des cotisations sociales la 1ère année (75% à partir du 1er juillet 2026)." />
              </Label>
              <p className="text-xs text-muted-foreground">
                Réduction de 50% des cotisations la 1ère année
              </p>
            </div>
            <Switch checked={hasACRE} onCheckedChange={onACREChange} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center cursor-pointer">
                Assujetti à la TVA
                <InfoTooltip content="Par défaut, les auto-entrepreneurs bénéficient de la franchise en base de TVA (pas de TVA collectée, pas de TVA déductible). Vous pouvez opter pour la TVA ou y être obligé si vous dépassez les seuils." />
              </Label>
              <p className="text-xs text-muted-foreground">
                Désactivé = franchise de base (pas de TVA)
              </p>
            </div>
            <Switch checked={isSubjectToVAT} onCheckedChange={onVATChange} />
          </div>

          {!hasVersementLiberatoire && (
            <div className="space-y-2">
              <Label className="flex items-center">
                Quotient familial (parts fiscales)
                <InfoTooltip content="Nombre de parts de votre foyer fiscal. Célibataire sans enfant = 1 part. Couple = 2 parts. Chaque enfant à charge ajoute 0,5 part." />
              </Label>
              <Select
                value={String(numberOfParts)}
                onValueChange={(v) => onNumberOfPartsChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} part{n > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Utilisé pour estimer l'impôt selon le barème progressif
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
