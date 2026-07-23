import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { formatMoney } from "@/lib/currency";
import { Plus, Search, Download, FileText, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/15 text-slate-600",
  pending: "bg-amber-500/15 text-amber-600",
  partially_paid: "bg-blue-500/15 text-blue-600",
  paid: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-red-500/15 text-red-600",
};

const PAGE_SIZE = 15;

export default function Invoices() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, paid, due, status, issue_date, notes, patient:profiles(full_name, phone), doctor:doctors(full_name)")
      .order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (dateFrom && r.issue_date < dateFrom) return false;
      if (dateTo && r.issue_date > dateTo) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          r.invoice_number?.toLowerCase().includes(s) ||
          r.patient?.full_name?.toLowerCase().includes(s) ||
          r.patient?.phone?.toLowerCase().includes(s) ||
          r.doctor?.full_name?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [rows, q, status, dateFrom, dateTo]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const remove = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invoice deleted");
    load();
  };

  const exportExcel = () => {
    const data = filtered.map((r) => ({
      Invoice: r.invoice_number,
      Patient: r.patient?.full_name,
      Phone: r.patient?.phone,
      Doctor: r.doctor?.full_name,
      Date: r.issue_date,
      Total: Number(r.total),
      Paid: Number(r.paid),
      Due: Number(r.due),
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, `invoices-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} invoice(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel}><Download className="w-4 h-4 mr-2" />Excel</Button>
          <Button onClick={() => navigate("/admin/billing/invoices/new")}><Plus className="w-4 h-4 mr-2" />New Invoice</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search # / patient / phone / doctor" className="pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partially_paid">Partially paid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Invoice #</th>
                <th className="p-3 font-medium">Patient</th>
                <th className="p-3 font-medium">Doctor</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium text-right">Total</th>
                <th className="p-3 font-medium text-right">Paid</th>
                <th className="p-3 font-medium text-right">Due</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={9} className="p-2"><Skeleton className="h-8 w-full" /></td></tr>
              ))}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan={9} className="p-12 text-center">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No invoices found</p>
                </td></tr>
              )}
              {!loading && paginated.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">
                    <Link to={`/admin/billing/invoices/${r.id}`} className="text-primary hover:underline">{r.invoice_number}</Link>
                  </td>
                  <td className="p-3">{r.patient?.full_name || "—"}<div className="text-xs text-muted-foreground">{r.patient?.phone}</div></td>
                  <td className="p-3">{r.doctor?.full_name || "—"}</td>
                  <td className="p-3">{r.issue_date}</td>
                  <td className="p-3 text-right">{formatMoney(r.total)}</td>
                  <td className="p-3 text-right text-emerald-600">{formatMoney(r.paid)}</td>
                  <td className="p-3 text-right text-amber-600">{formatMoney(r.due)}</td>
                  <td className="p-3"><Badge className={`${STATUS_COLORS[r.status]} border-0 capitalize`}>{r.status.replace("_", " ")}</Badge></td>
                  <td className="p-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                          <AlertDialogDescription>{r.invoice_number} and all its items/payments will be removed.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(r.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-3 flex items-center justify-between border-t">
            <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
