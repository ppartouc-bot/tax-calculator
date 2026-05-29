import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TaxResult } from "@/types/tax";
import { ACTIVITY_LABELS } from "@/types/tax";

interface TaxSummaryProps {
  result: TaxResult;
}

/* ── Animated SVG ring gauge ─────────────────── */
function RingGauge({ netPercent }: { netPercent: number }) {
  const size = 128;
  const sw = 10;
  const r = (size - sw) / 2;
  const circumference = 2 * Math.PI * r;
  const netDash = Math.min(Math.max(netPercent / 100, 0), 1) * circumference;
  const taxDash = circumference - netDash;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", display: "block" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(220 18% 16%)"
          strokeWidth={sw}
        />
        {/* Tax portion — red */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#FF4444"
          strokeWidth={sw}
          strokeDasharray={`${taxDash} ${circumference}`}
          strokeDashoffset={-netDash}
          strokeLinecap="round"
          style={{
            transition:
              "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1), stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)",
            filter: "drop-shadow(0 0 4px rgba(255,68,68,0.4))",
          }}
        />
        {/* Net portion — green */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#00FF80"
          strokeWidth={sw}
          strokeDasharray={`${netDash} ${circumference}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)",
            filter: "drop-shadow(0 0 6px rgba(0,255,128,0.5))",
          }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span
          className="font-display leading-none"
          style={{ fontSize: "30px", color: "#00FF80", textShadow: "0 0 16px rgba(0,255,128,0.5)" }}
        >
          {netPercent.toFixed(0)}%
        </span>
        <span
          className="font-mono text-[9px] tracking-widest uppercase"
          style={{ color: "hsl(215 10% 45%)" }}
        >
          gardé
        </span>
      </div>
    </div>
  );
}

/* ── Split bar ───────────────────────────────── */
function SplitBar({ netPercent }: { netPercent: number }) {
  return (
    <div className="threshold-bar w-full">
      <div
        className="threshold-bar-fill"
        style={{
          width: `${Math.max(0, Math.min(100, netPercent))}%`,
          background:
            "linear-gradient(90deg, #00FF80 0%, #00CC65 100%)",
          boxShadow: "0 0 8px rgba(0,255,128,0.3)",
        }}
      />
    </div>
  );
}

/* ── Line item ───────────────────────────────── */
function ChargeRow({
  label,
  amount,
  detail,
  delay,
}: {
  label: string;
  amount: number;
  detail?: string;
  delay: number;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-2.5"
      style={{
        borderBottom: "1px solid hsl(220 18% 16%)",
        animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground">
          {label}
        </p>
        {detail && (
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "hsl(215 10% 38%)" }}>
            {detail}
          </p>
        )}
      </div>
      <span
        className="font-mono text-sm font-bold shrink-0"
        style={{ color: "#FF4444", textShadow: "0 0 12px rgba(255,68,68,0.25)" }}
      >
        −{formatCurrency(amount)}
      </span>
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

  const netPercent = revenue > 0 ? (netIncome / revenue) * 100 : 0;
  const dangerWarnings = thresholdWarnings.filter(
    (w) => w.type === "vat_threshold_high" || w.percentage >= 100
  );
  const cautionWarnings = thresholdWarnings.filter(
    (w) => w.type !== "vat_threshold_high" && w.percentage < 100
  );

  return (
    <div className="space-y-4">
      {/* ── Alerts ─────────────────────── */}
      {dangerWarnings.map((w, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-lg p-4 border"
          style={{
            background: "hsla(0,85%,58%,0.08)",
            borderColor: "hsla(0,85%,58%,0.3)",
          }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#FF4444" }} />
          <p className="font-mono text-xs" style={{ color: "#FF7070" }}>
            {w.message}
          </p>
        </div>
      ))}
      {cautionWarnings.map((w, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-lg p-4 border"
          style={{
            background: "hsla(40,100%,50%,0.07)",
            borderColor: "hsla(40,100%,50%,0.25)",
          }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#FFAA00" }} />
          <p className="font-mono text-xs" style={{ color: "hsl(40 80% 70%)" }}>
            {w.message}
          </p>
        </div>
      ))}

      {/* ── Hero card ──────────────────── */}
      <div
        className="rounded-lg border card-ambient anim-1"
        style={{
          background: "hsl(220 18% 17%)",
          borderColor: "hsl(220 18% 18%)",
          padding: "1.5rem",
        }}
      >
        {/* Top row: net income + gauge */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <p
              className="font-mono text-[10px] tracking-widest uppercase mb-2"
              style={{ color: "hsl(215 10% 45%)" }}
            >
              Revenu net estimé
            </p>
            <div
              className="font-display leading-none mb-1"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                color: "#00FF80",
                textShadow: "0 0 30px rgba(0,255,128,0.35)",
                letterSpacing: "0.02em",
              }}
            >
              {formatCurrency(netIncome)}
            </div>
            <p
              className="font-mono text-xs mt-2"
              style={{ color: "hsl(215 10% 45%)" }}
            >
              <span style={{ color: ACTIVITY_LABELS[activityCategory] ? "hsl(40 80% 60%)" : undefined }}>
                {ACTIVITY_LABELS[activityCategory]}
              </span>
            </p>
          </div>
          <RingGauge netPercent={netPercent} />
        </div>

        {/* Split bar */}
        <SplitBar netPercent={netPercent} />
        <div className="flex justify-between mt-2 mb-5">
          <span className="font-mono text-[10px]" style={{ color: "#00CC65" }}>
            Net {formatCurrency(netIncome)}
          </span>
          <span className="font-mono text-[10px]" style={{ color: "#CC3333" }}>
            Charges {formatCurrency(totalCharges)}
          </span>
        </div>

        {/* Metrics row */}
        <div
          className="grid grid-cols-3 gap-3 p-4 rounded-md mb-5"
          style={{ background: "hsl(222 20% 13%)" }}
        >
          <div className="text-center">
            <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">CA</p>
            <p className="font-display text-xl leading-none" style={{ color: "hsl(215 18% 80%)" }}>
              {(revenue / 1000).toFixed(0)}k
            </p>
            <p className="font-mono text-[9px] text-muted-foreground mt-0.5">€</p>
          </div>
          <div className="text-center" style={{ borderLeft: "1px solid hsl(220 18% 18%)", borderRight: "1px solid hsl(220 18% 18%)" }}>
            <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">Charges</p>
            <p className="font-display text-xl leading-none" style={{ color: "#FF4444" }}>
              {(totalCharges / 1000).toFixed(1)}k
            </p>
            <p className="font-mono text-[9px] text-muted-foreground mt-0.5">€</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">Taux eff.</p>
            <p className="font-display text-xl leading-none" style={{ color: "#FFAA00" }}>
              {effectiveRate.toFixed(1)}
            </p>
            <p className="font-mono text-[9px] text-muted-foreground mt-0.5">%</p>
          </div>
        </div>

        {/* Charge detail */}
        <div>
          <div className="divider-label mb-3">Détail des charges</div>

          <ChargeRow
            label="Cotisations sociales"
            amount={cotisationsSociales.amount}
            detail={`${cotisationsSociales.rate}% du CA${
              cotisationsSociales.acreRate !== undefined
                ? ` — ACRE : ${cotisationsSociales.acreRate.toFixed(1)}%`
                : ""
            }`}
            delay={60}
          />
          <ChargeRow
            label={
              impotRevenu.method === "versement_liberatoire"
                ? "Versement libératoire"
                : "Impôt sur le revenu"
            }
            amount={impotRevenu.amount}
            detail={
              impotRevenu.method === "versement_liberatoire"
                ? `${impotRevenu.rate}% du CA`
                : impotRevenu.taxableIncome !== undefined
                ? `Base : ${formatCurrency(impotRevenu.taxableIncome)}`
                : undefined
            }
            delay={120}
          />
          {!vat.isExempt && (
            <ChargeRow
              label="TVA nette à reverser"
              amount={vat.vatDue}
              detail={`Collectée ${formatCurrency(vat.vatCollected)} − Déductible ${formatCurrency(vat.vatDeductible)}`}
              delay={180}
            />
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-3 mt-1">
            <span
              className="font-mono text-[11px] tracking-widest uppercase"
              style={{ color: "hsl(215 10% 50%)" }}
            >
              Total charges
            </span>
            <span
              className="font-display text-2xl leading-none"
              style={{ color: "#FF4444", textShadow: "0 0 16px rgba(255,68,68,0.3)" }}
            >
              −{formatCurrency(totalCharges)}
            </span>
          </div>
        </div>

        {/* TVA franchise notice */}
        {vat.isExempt && (
          <div
            className="mt-4 rounded p-3 font-mono text-[10px] leading-relaxed"
            style={{
              background: "hsl(222 20% 13%)",
              color: "hsl(215 10% 45%)",
              borderLeft: "2px solid hsl(222 22% 18%)",
            }}
          >
            FRANCHISE TVA : pas de TVA collectée ni déductible.
            Seuils : {vat.thresholdBase.toLocaleString("fr-FR")} € / {vat.thresholdHigh.toLocaleString("fr-FR")} €
          </div>
        )}

        {impotRevenu.method === "bareme_progressif" && (
          <p
            className="mt-3 font-mono text-[10px] leading-relaxed"
            style={{ color: "hsl(215 10% 38%)" }}
          >
            * Estimation IR basée sur ce seul revenu. Autres revenus du foyer peuvent modifier ce montant.
          </p>
        )}
      </div>
    </div>
  );
}
