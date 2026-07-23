import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatMoney } from "@/lib/currency";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoiceId: string;
  clinicId?: string | null;
  due: number;
  onSaved?: () => void;
};

const METHODS = ["cash", "card", "insurance", "transfer", "online"] as const;

export default function PaymentDialog({ open, onOpenChange, invoiceId, clinicId, due, onSaved }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>(due > 0 ? String(due) : "");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (amt > due + 0.001) return toast.error(`Amount exceeds remaining ${formatMoney(due)}`);
    setSaving(true);
    const { error } = await supabase.from("payments").insert({
      invoice_id: invoiceId,
      clinic_id: clinicId ?? null,
      payment_method: method,
      reference: reference || null,
      amount: amt,
      received_by: user?.id ?? null,
      payment_date: date,
      notes: notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Amount (MAD)</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Remaining due: {formatMoney(due)}</p>
          </div>
          <div>
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reference</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Cheque #, txn id…" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Payment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
