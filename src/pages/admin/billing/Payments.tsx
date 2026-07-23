import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/currency";
import { Download, Search, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";

const METHODS = ["all", "cash", "card", "insurance", "transfer", "online"];

export default function Payments() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, payment_method, reference, payment_date, notes, invoice:invoices(invoice_number, patient:profiles(full_name, phone))")
        .order("payment_date", { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (method !== "all" && r.payment_method !== method) return false;
    if (from && r.payment_date < from) return false;
    if (to && r.payment_date > to) return false;
    if (q) {
      const s = q.toLowerCase();
      return (
        r.invoice?.invoice_number?.toLowerCase().includes(s) ||
        r.invoice?.patient?.full_name?.toLowerCase().includes(s) ||
        r.invoice?.patient?.phone?.toLowerCase().includes(s) ||
        r.reference?.toLowerCase().includes(s)
      );
    }
    return true;
  }), [rows, q, method, from, to]);

  const total = filtered.reduce((s, r) => s + Number(r.amount), 0);

  const exportExcel = () => {
    const data = filtered.map((r) => ({
      Date: r.payment_date, Invoice: r.invoice?.invoice_number, Patient: r.invoice?.patient?.full_name,
      Method: r.payment_method, Reference: r.reference, Amount: Number(r.amount),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, `payments-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} payment(s) · Total {formatMoney(total)}</p>
        </div>
        <Button variant="outline" onClick={exportExcel}><Download className="w-4 h-4 mr-2" />Excel</Button>
      </div>

      <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search # / patient / reference" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m === "all" ? "All methods" : m}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Invoice</th>
              <th className="p-3 font-medium">Patient</th>
              <th className="p-3 font-medium">Method</th>
              <th className="p-3 font-medium">Reference</th>
              <th className="p-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={6} className="p-2"><Skeleton className="h-8" /></td></tr>)}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center">
                <Wallet className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No payments</p>
              </td></tr>
            )}
            {!loading && filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="p-3">{r.payment_date}</td>
                <td className="p-3"><Link className="text-primary hover:underline" to={`/admin/billing/invoices`}>{r.invoice?.invoice_number}</Link></td>
                <td className="p-3">{r.invoice?.patient?.full_name}<div className="text-xs text-muted-foreground">{r.invoice?.patient?.phone}</div></td>
                <td className="p-3"><Badge variant="secondary" className="capitalize">{r.payment_method}</Badge></td>
                <td className="p-3">{r.reference || "—"}</td>
                <td className="p-3 text-right font-semibold">{formatMoney(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
