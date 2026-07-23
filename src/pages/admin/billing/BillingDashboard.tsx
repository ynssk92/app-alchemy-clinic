import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Wallet, CalendarClock, AlertCircle, Receipt, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#203080", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, month: 0, outstanding: 0, paidToday: 0, pending: 0 });
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);
  const [methods, setMethods] = useState<{ name: string; value: number }[]>([]);
  const [trend, setTrend] = useState<{ day: string; due: number }[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const firstOfMonth = new Date(); firstOfMonth.setDate(1);
      const monthStart = firstOfMonth.toISOString().slice(0, 10);
      const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1);

      const [payToday, payMonth, invAll, invPending, payAllRecent, invRecent] = await Promise.all([
        supabase.from("payments").select("amount, payment_date").gte("payment_date", today),
        supabase.from("payments").select("amount, payment_date, payment_method").gte("payment_date", sixMonthsAgo.toISOString().slice(0, 10)),
        supabase.from("invoices").select("due, total, status"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["pending", "partially_paid"]),
        supabase.from("payments").select("id, amount, payment_date, payment_method, reference, invoice:invoices(invoice_number, patient:profiles(full_name))").order("created_at", { ascending: false }).limit(6),
        supabase.from("invoices").select("id, invoice_number, total, due, status, issue_date, patient:profiles(full_name)").order("created_at", { ascending: false }).limit(6),
      ]);

      const paidToday = (payToday.data || []).reduce((s, r) => s + Number(r.amount), 0);
      const outstanding = (invAll.data || []).reduce((s, r) => s + Number(r.due), 0);
      const monthPaid = (payMonth.data || [])
        .filter((r) => r.payment_date >= monthStart)
        .reduce((s, r) => s + Number(r.amount), 0);

      // Monthly grouping (6 months)
      const monthMap: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
        monthMap[d.toISOString().slice(0, 7)] = 0;
      }
      (payMonth.data || []).forEach((r) => {
        const k = r.payment_date.slice(0, 7);
        if (k in monthMap) monthMap[k] += Number(r.amount);
      });
      const monthlyArr = Object.entries(monthMap).map(([k, v]) => ({
        month: new Date(k + "-01").toLocaleDateString("en", { month: "short" }),
        total: Math.round(v * 100) / 100,
      }));

      const methodMap: Record<string, number> = {};
      (payMonth.data || []).forEach((r) => {
        methodMap[r.payment_method] = (methodMap[r.payment_method] || 0) + Number(r.amount);
      });
      const methodsArr = Object.entries(methodMap).map(([k, v]) => ({ name: k, value: Math.round(v * 100) / 100 }));

      // Outstanding trend (14 days) — invoices created per day, sum due
      const { data: invTrend } = await supabase
        .from("invoices").select("created_at, due")
        .gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString());
      const dayMap: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        dayMap[d] = 0;
      }
      (invTrend || []).forEach((r: any) => {
        const k = r.created_at.slice(0, 10);
        if (k in dayMap) dayMap[k] += Number(r.due);
      });

      setStats({
        today: paidToday,
        month: monthPaid,
        outstanding,
        paidToday,
        pending: invPending.count || 0,
      });
      setMonthly(monthlyArr);
      setMethods(methodsArr);
      setTrend(Object.entries(dayMap).map(([d, due]) => ({ day: d.slice(5), due })));
      setRecentPayments(payAllRecent.data || []);
      setRecentInvoices(invRecent.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;

  const cards = [
    { label: "Today's Revenue", value: formatMoney(stats.today), icon: Wallet, tint: "bg-primary/10 text-primary" },
    { label: "Monthly Revenue", value: formatMoney(stats.month), icon: TrendingUp, tint: "bg-emerald-500/10 text-emerald-600" },
    { label: "Outstanding", value: formatMoney(stats.outstanding), icon: AlertCircle, tint: "bg-amber-500/10 text-amber-600" },
    { label: "Pending Invoices", value: String(stats.pending), icon: Receipt, tint: "bg-blue-500/10 text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing Dashboard</h1>
        <p className="text-sm text-muted-foreground">Revenue, outstanding balances and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.tint}`}><c.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <div className="text-xl font-bold">{c.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-2">
          <h3 className="font-semibold mb-4">Revenue by Month</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) => formatMoney(v)} />
                <Bar dataKey="total" fill="#203080" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Payment Methods</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={methods} dataKey="value" nameKey="name" outerRadius={80} label>
                  {methods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Outstanding Trend (14 days)</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(v: any) => formatMoney(v)} />
              <Line type="monotone" dataKey="due" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Latest Payments</h3>
            <Link to="/admin/billing/payments" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {recentPayments.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No payments yet</div>}
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <div className="text-sm font-medium">{p.invoice?.invoice_number} · {p.invoice?.patient?.full_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.payment_method} · {p.payment_date}</div>
                </div>
                <div className="text-sm font-semibold">{formatMoney(p.amount)}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Latest Invoices</h3>
            <Link to="/admin/billing/invoices" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {recentInvoices.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No invoices yet</div>}
            {recentInvoices.map((i) => (
              <Link key={i.id} to={`/admin/billing/invoices/${i.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <div className="text-sm font-medium">{i.invoice_number} · {i.patient?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{i.issue_date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">{i.status.replace("_", " ")}</Badge>
                  <div className="text-sm font-semibold">{formatMoney(i.total)}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
