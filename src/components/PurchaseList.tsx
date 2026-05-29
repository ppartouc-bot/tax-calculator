import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import type { Purchase } from "@/types/tax";
import { VAT_RATES } from "@/types/tax";

interface PurchaseListProps {
  purchases: Purchase[];
  isSubjectToVAT: boolean;
  onAdd: (purchase: Omit<Purchase, "id">) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Purchase, "id">>) => void;
}

interface FormState {
  description: string;
  amountHT: string;
  vatRate: string;
}

const EMPTY: FormState = { description: "", amountHT: "", vatRate: "20" };

export function PurchaseList({ purchases, isSubjectToVAT, onAdd, onRemove }: PurchaseListProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const totalHT = purchases.reduce((s, p) => s + p.amountHT, 0);
  const totalVAT = purchases.reduce((s, p) => s + (p.amountHT * p.vatRate) / 100, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountHT = parseFloat(form.amountHT);
    if (!form.description || isNaN(amountHT) || amountHT <= 0) return;
    onAdd({ description: form.description, amountHT, vatRate: Number(form.vatRate) });
    setForm(EMPTY);
    setShowForm(false);
  }

  return (
    <div
      className="rounded-lg border card-ambient"
      style={{ background: "hsl(220 18% 17%)", borderColor: "hsl(220 18% 18%)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid hsl(220 18% 15%)" }}
      >
        <span className="font-display text-xl tracking-wider" style={{ color: "hsl(40 100% 60%)" }}>
          Achats professionnels
        </span>
        {purchases.length > 0 && (
          <span
            className="font-mono text-[10px] tracking-wider px-2 py-1 rounded"
            style={{
              background: "hsla(40,100%,50%,0.1)",
              color: "hsl(40 100% 60%)",
              border: "1px solid hsla(40,100%,50%,0.2)",
            }}
          >
            {purchases.length} ligne{purchases.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        {/* TVA notice */}
        <p className="font-mono text-[10px]" style={{ color: "hsl(215 10% 40%)" }}>
          {isSubjectToVAT
            ? "▸ TVA déductible de la TVA collectée"
            : "▸ Franchise TVA : TVA non récupérable"}
        </p>

        {/* Purchase rows */}
        {purchases.length === 0 && !showForm && (
          <div className="py-6 text-center">
            <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "hsl(215 10% 32%)" }}>
              Aucune dépense enregistrée
            </p>
          </div>
        )}

        {purchases.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded"
            style={{
              background: "hsl(222 20% 13%)",
              border: "1px solid hsl(220 18% 16%)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs truncate" style={{ color: "hsl(215 18% 78%)" }}>
                {p.description}
              </p>
              <p className="font-mono text-[10px] mt-0.5" style={{ color: "hsl(215 10% 42%)" }}>
                {formatCurrency(p.amountHT)} HT
                {p.vatRate > 0 && <> + TVA {p.vatRate}%</>}
                {isSubjectToVAT && p.vatRate > 0 && (
                  <span style={{ color: "#00CC65" }}>
                    {" "}→ -{formatCurrency((p.amountHT * p.vatRate) / 100)} TVA déd.
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => onRemove(p.id)}
              className="shrink-0 p-1.5 rounded transition-colors duration-150"
              style={{ color: "hsl(215 10% 38%)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FF4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(215 10% 38%)")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Add form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded p-4 space-y-3"
            style={{
              background: "hsl(222 20% 13%)",
              border: "1px solid hsla(40,100%,50%,0.15)",
            }}
          >
            <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "hsl(40 100% 55%)" }}>
              Nouvel achat
            </p>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "hsl(215 10% 45%)" }}>
                Description
              </Label>
              <Input
                placeholder="Ex : Ordinateur, logiciels..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                className="mt-1 h-9 font-mono text-xs"
                style={{ background: "hsl(222 20% 13%)", border: "1px solid hsl(222 22% 15%)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "hsl(215 10% 45%)" }}>
                  Montant HT (€)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amountHT}
                  onChange={(e) => setForm((f) => ({ ...f, amountHT: e.target.value }))}
                  required
                  className="mt-1 h-9 font-mono text-xs"
                  style={{ background: "hsl(222 20% 13%)", border: "1px solid hsl(222 22% 15%)" }}
                />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "hsl(215 10% 45%)" }}>
                  Taux TVA
                </Label>
                <Select
                  value={form.vatRate}
                  onValueChange={(v) => setForm((f) => ({ ...f, vatRate: v }))}
                >
                  <SelectTrigger className="mt-1 h-9 font-mono text-xs" style={{ background: "hsl(222 20% 13%)", border: "1px solid hsl(222 22% 15%)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((rate) => (
                      <SelectItem key={rate} value={String(rate)} className="font-mono text-xs">
                        {rate}%{rate === 20 ? " — standard" : rate === 0 ? " — exonéré" : " — réduit"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                className="font-mono text-xs h-8 px-4"
                style={{ background: "hsl(40 100% 50%)", color: "hsl(222 28% 4%)" }}
              >
                Ajouter
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="font-mono text-xs h-8 px-4"
                style={{ color: "hsl(215 10% 50%)" }}
                onClick={() => { setShowForm(false); setForm(EMPTY); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {/* Add button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-mono text-[11px] tracking-widest uppercase transition-colors duration-200"
            style={{
              border: "1px dashed hsl(222 22% 16%)",
              color: "hsl(215 10% 40%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "hsla(40,100%,50%,0.3)";
              e.currentTarget.style.color = "hsl(40 100% 60%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "hsl(222 22% 16%)";
              e.currentTarget.style.color = "hsl(215 10% 40%)";
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un achat
          </button>
        )}

        {/* Totals */}
        {purchases.length > 0 && (
          <div
            className="pt-2 space-y-1"
            style={{ borderTop: "1px solid hsl(220 18% 16%)" }}
          >
            {[
              ["Total HT", formatCurrency(totalHT), false],
              ["Total TVA", formatCurrency(totalVAT), false],
              ["Total TTC", formatCurrency(totalHT + totalVAT), true],
            ].map(([label, value, bold]) => (
              <div key={label as string} className="flex justify-between">
                <span className="font-mono text-[10px]" style={{ color: "hsl(215 10% 42%)" }}>
                  {label}
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: bold ? "hsl(215 18% 78%)" : "hsl(215 10% 50%)", fontWeight: bold ? 700 : 400 }}
                >
                  {value}
                </span>
              </div>
            ))}
            {isSubjectToVAT && totalVAT > 0 && (
              <p className="font-mono text-[10px] pt-1" style={{ color: "#00CC65" }}>
                ▸ TVA déductible : {formatCurrency(totalVAT)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
