import { Info } from "lucide-react";
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

function InfoTip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 cursor-help inline-block ml-1.5 shrink-0" style={{ color: "hsl(215 10% 38%)" }} />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs font-mono text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function OptionRow({
  label,
  description,
  checked,
  onCheckedChange,
  tooltip,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  tooltip: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-md px-4 py-3 gap-4 transition-colors duration-200"
      style={{
        background: checked ? "hsla(40,100%,50%,0.06)" : "hsl(222 25% 6%)",
        border: `1px solid ${checked ? "hsla(40,100%,50%,0.2)" : "hsl(220 18% 18%)"}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <span
            className="font-mono text-[11px] tracking-widest uppercase"
            style={{ color: checked ? "hsl(40 100% 65%)" : "hsl(215 12% 65%)" }}
          >
            {label}
          </span>
          <InfoTip content={tooltip} />
        </div>
        <p className="font-mono text-[10px] mt-0.5" style={{ color: "hsl(215 10% 40%)" }}>
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
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
  const thresholdPercent = revenue > 0 ? Math.min((revenue / caLimit) * 100, 100) : 0;

  const thresholdColor =
    thresholdPercent >= 90
      ? "#FF4444"
      : thresholdPercent >= 70
      ? "#FFAA00"
      : "#00FF80";

  return (
    <div
      className="rounded-lg border card-ambient"
      style={{ background: "hsl(220 18% 17%)", borderColor: "hsl(220 18% 18%)" }}
    >
      {/* Panel header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid hsl(220 18% 15%)" }}
      >
        <span
          className="font-display text-xl tracking-wider"
          style={{ color: "hsl(40 100% 60%)" }}
        >
          Votre situation
        </span>
        <span
          className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded"
          style={{
            background: "hsl(222 20% 13%)",
            color: "hsl(215 10% 45%)",
            border: "1px solid hsl(220 18% 18%)",
          }}
        >
          2026
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* ── CA input ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "hsl(215 10% 50%)" }}>
              Chiffre d'affaires annuel (€ HT)
              <InfoTip content="Montant total facturé hors taxes sur l'année." />
            </Label>
            <span
              className="font-mono text-[10px] tracking-wider"
              style={{ color: thresholdColor }}
            >
              {thresholdPercent.toFixed(0)}% du plafond
            </span>
          </div>

          {/* Big CA input */}
          <div className="relative">
            <Input
              id="revenue"
              type="number"
              min="0"
              max={caLimit}
              step="100"
              placeholder="0"
              value={revenue || ""}
              onChange={(e) => onRevenueChange(Number(e.target.value))}
              className="font-display text-3xl h-14 pr-10 tracking-wider"
              style={{
                background: "hsl(222 20% 13%)",
                border: "1px solid hsl(220 18% 17%)",
                color: "hsl(40 100% 65%)",
                letterSpacing: "0.04em",
              }}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 font-display text-2xl"
              style={{ color: "hsl(222 22% 25%)" }}
            >
              €
            </span>
          </div>

          {/* Threshold bar */}
          <div className="threshold-bar">
            <div
              className="threshold-bar-fill"
              style={{
                width: `${thresholdPercent}%`,
                background: `linear-gradient(90deg, ${thresholdColor}aa, ${thresholdColor})`,
                boxShadow: `0 0 6px ${thresholdColor}44`,
              }}
            />
          </div>
          <p className="font-mono text-[10px]" style={{ color: "hsl(215 10% 38%)" }}>
            Plafond : {caLimit.toLocaleString("fr-FR")} €
          </p>
        </div>

        {/* ── Activity category ── */}
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "hsl(215 10% 50%)" }}>
            Catégorie d'activité
            <InfoTip content="Détermine vos taux de cotisations, d'abattement fiscal et vos plafonds." />
          </Label>
          <Select
            value={activityCategory}
            onValueChange={(v) => onCategoryChange(v as ActivityCategory)}
          >
            <SelectTrigger
              className="font-mono text-xs h-10"
              style={{
                background: "hsl(222 20% 13%)",
                border: "1px solid hsl(220 18% 17%)",
                color: "hsl(215 18% 80%)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ACTIVITY_LABELS) as [ActivityCategory, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value} className="font-mono text-xs">
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <p className="font-mono text-[10px]" style={{ color: "hsl(215 10% 38%)" }}>
            Cotisations {cotisRate}% — VL {vlRate}%
          </p>
        </div>

        {/* ── Options ── */}
        <div className="space-y-2">
          <div className="divider-label">Options fiscales</div>
          <div className="space-y-2">
            <OptionRow
              label="Versement libératoire"
              description={`${vlRate}% du CA — au lieu du barème progressif`}
              checked={hasVersementLiberatoire}
              onCheckedChange={onVersementLiberatoireChange}
              tooltip={`Payer l'IR avec les cotisations sociales. Taux : ${vlRate}% du CA. Avantageux si votre tranche est élevée.`}
            />
            <OptionRow
              label="ACRE — 1ère année"
              description="−50% sur cotisations (−75% à partir du 1er juillet 2026)"
              checked={hasACRE}
              onCheckedChange={onACREChange}
              tooltip="Aide à la Création et Reprise d'Entreprise : exonération partielle de cotisations sociales."
            />
            <OptionRow
              label="Assujetti à la TVA"
              description="Activé = TVA collectée et déductible"
              checked={isSubjectToVAT}
              onCheckedChange={onVATChange}
              tooltip="Par défaut, franchise en base (pas de TVA). Obligatoire si vous dépassez les seuils ou sur option."
            />
          </div>
        </div>

        {/* ── Quotient familial ── */}
        {!hasVersementLiberatoire && (
          <div className="space-y-2">
            <Label className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "hsl(215 10% 50%)" }}>
              Quotient familial
              <InfoTip content="Nombre de parts fiscales. Célibataire = 1 part. Couple = 2 parts. +0,5 par enfant à charge." />
            </Label>
            <Select
              value={String(numberOfParts)}
              onValueChange={(v) => onNumberOfPartsChange(Number(v))}
            >
              <SelectTrigger
                className="font-mono text-xs h-10"
                style={{
                  background: "hsl(222 20% 13%)",
                  border: "1px solid hsl(220 18% 17%)",
                  color: "hsl(215 18% 80%)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => (
                  <SelectItem key={n} value={String(n)} className="font-mono text-xs">
                    {n} part{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
