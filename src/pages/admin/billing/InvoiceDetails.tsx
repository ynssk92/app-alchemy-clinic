import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Wallet, ArrowLeft, XCircle, Download, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import PaymentDialog from "@/components/admin/PaymentDialog";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/15 text-slate-600",
  pending: "bg-amber-500/15 text-amber-600",
  partially_paid: "bg-blue-500/15 text-blue-600",
  paid: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-red-500/15 text-red-600",
};

export default function InvoiceDetails() {
  const { id } = useParams();
  const [inv, setInv] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [i, it, p] = await Promise.all([
      supabase.from("invoices").select("*, patient:profiles(full_name, phone), doctor:doctors(full_name), clinic:clinics(name, address, phone)").eq("id", id).maybeSingle(),
      supabase.from("invoice_items").select("*").eq("invoice_id", id).order("created_at"),
      supabase.from("payments").select("*").eq("invoice_id", id).order("payment_date", { ascending: false }),
    ]);
    setInv(i.data);
    setItems(it.data || []);
    setPayments(p.data || []);
    setClinic(i.data?.clinic);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const cancel = async () => {
    if (!inv) return;
    const { error } = await supabase.from("invoices").update({ status: "cancelled" }).eq("id", inv.id);
    if (error) return toast.error(error.message);
    toast.success("Invoice cancelled");
    load();
  };

  const issue = async () => {
    const { error } = await supabase.from("invoices").update({ status: "pending" }).eq("id", inv.id);
    if (error) return toast.error(error.message);
    load();
  };

  const exportPDF = async () => {
    if (!printRef.current || !inv) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${inv.invoice_number}.pdf`);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!inv) return <div className="p-6">Invoice not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/admin/billing/invoices" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to invoices
        </Link>
        <div className="flex gap-2">
          {inv.status === "draft" && <Button variant="outline" onClick={issue}>Issue</Button>}
          {inv.status !== "cancelled" && inv.status !== "paid" && (
            <Button onClick={() => setPayOpen(true)}><Wallet className="w-4 h-4 mr-2" />Record Payment</Button>
          )}
          <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Print</Button>
          <Button variant="outline" onClick={exportPDF} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {exporting ? "Generating…" : "Download PDF"}
          </Button>
          {inv.status !== "cancelled" && (
            <Button variant="outline" className="text-destructive" onClick={cancel}><XCircle className="w-4 h-4 mr-2" />Cancel</Button>
          )}
        </div>
      </div>

      <Card className="p-8 print:shadow-none print:border-0" id="invoice-print">
        <div className="flex justify-between items-start mb-8">
          <div>
            <img src={logo} alt="La Dune" className="h-10 mb-3" />
            {clinic && (
              <div className="text-sm text-muted-foreground">
                <div className="font-semibold text-foreground">{clinic.name}</div>
                <div>{clinic.address}</div>
                <div>{clinic.phone}</div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">INVOICE</div>
            <div className="text-primary font-semibold mt-1">{inv.invoice_number}</div>
            <div className="text-sm text-muted-foreground mt-1">Issue Date: {inv.issue_date}</div>
            <Badge className={`${STATUS_COLORS[inv.status]} border-0 capitalize mt-2`}>{inv.status.replace("_", " ")}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-1">Bill To</div>
            <div className="font-semibold">{inv.patient?.full_name}</div>
            <div className="text-sm text-muted-foreground">{inv.patient?.phone}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-1">Doctor</div>
            <div className="font-semibold">{inv.doctor?.full_name || "—"}</div>
          </div>
        </div>

        <table className="w-full text-sm border-t">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Description</th>
              <th className="py-2 text-right w-16">Qty</th>
              <th className="py-2 text-right w-28">Price</th>
              <th className="py-2 text-right w-24">Discount</th>
              <th className="py-2 text-right w-24">Tax</th>
              <th className="py-2 text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2">{i.description}</td>
                <td className="py-2 text-right">{Number(i.qty)}</td>
                <td className="py-2 text-right">{formatMoney(i.unit_price)}</td>
                <td className="py-2 text-right">{formatMoney(i.discount)}</td>
                <td className="py-2 text-right">{formatMoney(i.tax)}</td>
                <td className="py-2 text-right font-medium">{formatMoney(i.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-1 text-sm">
            <Row label="Subtotal" value={formatMoney(inv.subtotal)} />
            <Row label="Discount" value={`- ${formatMoney(inv.discount)}`} />
            <Row label="Tax" value={formatMoney(inv.tax)} />
            <div className="border-t pt-1"><Row label="Total" value={formatMoney(inv.total)} bold /></div>
            <Row label="Paid" value={formatMoney(inv.paid)} className="text-emerald-600" />
            <Row label="Remaining" value={formatMoney(inv.due)} bold className="text-amber-600" />
          </div>
        </div>

        {inv.notes && (
          <div className="mt-8 text-sm">
            <div className="text-xs uppercase text-muted-foreground mb-1">Notes</div>
            <p>{inv.notes}</p>
          </div>
        )}
      </Card>

      <Card className="p-6 print:hidden">
        <h3 className="font-semibold mb-3">Payments</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Method</th>
                <th className="p-2">Reference</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.payment_date}</td>
                  <td className="p-2 capitalize">{p.payment_method}</td>
                  <td className="p-2">{p.reference || "—"}</td>
                  <td className="p-2 text-right font-medium">{formatMoney(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} invoiceId={inv.id} clinicId={inv.clinic_id} due={Number(inv.due)} onSaved={load} />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; inset: 0; }
        }
      `}</style>
    </div>
  );
}

const Row = ({ label, value, bold, className = "" }: { label: string; value: string; bold?: boolean; className?: string }) => (
  <div className={`flex justify-between ${bold ? "font-bold text-base" : ""} ${className}`}>
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);
