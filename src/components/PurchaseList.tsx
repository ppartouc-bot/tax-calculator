import { useState } from "react";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

interface PurchaseFormState {
  description: string;
  amountHT: string;
  vatRate: string;
}

const EMPTY_FORM: PurchaseFormState = {
  description: "",
  amountHT: "",
  vatRate: "20",
};

export function PurchaseList({
  purchases,
  isSubjectToVAT,
  onAdd,
  onRemove,
}: PurchaseListProps) {
  const [form, setForm] = useState<PurchaseFormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const totalHT = purchases.reduce((s, p) => s + p.amountHT, 0);
  const totalVAT = purchases.reduce((s, p) => s + (p.amountHT * p.vatRate) / 100, 0);
  const totalTTC = totalHT + totalVAT;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountHT = parseFloat(form.amountHT);
    if (!form.description || isNaN(amountHT) || amountHT <= 0) return;

    onAdd({
      description: form.description,
      amountHT,
      vatRate: Number(form.vatRate),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Achats professionnels
            </CardTitle>
            <CardDescription className="mt-1">
              {isSubjectToVAT
                ? "La TVA sur vos achats est déductible de la TVA collectée."
                : "En franchise TVA, vous ne récupérez pas la TVA sur vos achats."}
            </CardDescription>
          </div>
          {purchases.length > 0 && (
            <Badge variant="secondary">{purchases.length} achat{purchases.length > 1 ? "s" : ""}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {purchases.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun achat enregistré. Ajoutez vos dépenses professionnelles.
          </p>
        )}

        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="flex items-center justify-between rounded-lg border p-3 gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{purchase.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(purchase.amountHT)} HT
                {purchase.vatRate > 0 && (
                  <> + TVA {purchase.vatRate}% = {formatCurrency(purchase.amountHT * (1 + purchase.vatRate / 100))} TTC</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isSubjectToVAT && purchase.vatRate > 0 && (
                <Badge variant="success" className="text-xs">
                  -{formatCurrency((purchase.amountHT * purchase.vatRate) / 100)} TVA
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(purchase.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <h4 className="text-sm font-medium">Nouvel achat</h4>
            <div className="space-y-2">
              <Label htmlFor="purchase-desc">Description</Label>
              <Input
                id="purchase-desc"
                placeholder="Ex : Ordinateur portable, fournitures..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="purchase-amount">Montant HT (€)</Label>
                <Input
                  id="purchase-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amountHT}
                  onChange={(e) => setForm((f) => ({ ...f, amountHT: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-vat">Taux TVA</Label>
                <Select
                  value={form.vatRate}
                  onValueChange={(v) => setForm((f) => ({ ...f, vatRate: v }))}
                >
                  <SelectTrigger id="purchase-vat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((rate) => (
                      <SelectItem key={rate} value={String(rate)}>
                        {rate}%{rate === 20 ? " (standard)" : rate === 10 ? " (réduit)" : rate === 5.5 ? " (réduit)" : " (exonéré)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm">Ajouter</Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {!showForm && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un achat professionnel
          </Button>
        )}

        {purchases.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Total HT</span>
                <span>{formatCurrency(totalHT)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total TVA</span>
                <span>{formatCurrency(totalVAT)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total TTC</span>
                <span>{formatCurrency(totalTTC)}</span>
              </div>
              {isSubjectToVAT && (
                <p className="text-xs text-green-700 bg-green-50 rounded p-2 mt-2">
                  TVA déductible : {formatCurrency(totalVAT)} (déduite de votre TVA à payer)
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
