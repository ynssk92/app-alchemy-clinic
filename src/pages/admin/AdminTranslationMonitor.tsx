import { useEffect, useState } from "react";
import { 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  History, 
  CreditCard,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

interface TranslationError {
  timestamp: string;
  error: string;
  texts?: string[];
  count?: number;
  type?: "credit" | "error" | "fallback";
  reason?: string;
}

const AdminTranslationMonitor = () => {
  const [errors, setErrors] = useState<TranslationError[]>([]);
  const [loading, setLoading] = useState(true);
  
  // These are snapshots from the agent tool check at 19:07 UTC
  // In a real app, these would come from an edge function querying the Lovable API
  const creditStats = {
    used: 23.46,
    limit: 5.00,
    remaining: 0,
    period: "Aug 1 - Sep 1, 2026"
  };

  const isExhausted = creditStats.used >= creditStats.limit;

  useEffect(() => {
    const loadLogs = () => {
      try {
        const logs = JSON.parse(localStorage.getItem("ladune_translation_errors") || "[]");
        setErrors(logs);
      } catch (e) {
        console.error("Failed to load translation logs", e);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
    // Refresh logs every 30 seconds if page is open
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const clearLogs = () => {
    localStorage.removeItem("ladune_translation_errors");
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI & Translation Monitor</h1>
          <p className="text-muted-foreground">Monitor credit usage and translation system health.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary">
            <a href="https://lovable.dev/projects/xseilsdlrcakjevtmcfw/billing" target="_blank" rel="noopener noreferrer">
              <CreditCard className="mr-2 h-4 w-4" /> Manage Billing
            </a>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Credit Status Card */}
        <Card className={isExhausted ? "border-destructive/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Translation Credits
              {isExhausted ? (
                <Badge variant="destructive" className="animate-pulse">Exhausted</Badge>
              ) : (
                <Badge variant="outline" className="text-positive border-positive/50">Healthy</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.used.toFixed(2)} / {creditStats.limit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Credits used in current period</p>
            <Progress 
              value={Math.min((creditStats.used / creditStats.limit) * 100, 100)} 
              className={`h-2 mt-4 ${isExhausted ? "bg-destructive/20" : ""}`}
            />
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{creditStats.period}</span>
              <span>{Math.round((creditStats.used / creditStats.limit) * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* System Health Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Engine Status
              {errors.length > 0 && new Date(errors[0].timestamp).getTime() > Date.now() - 3600000 ? (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Issues Detected</Badge>
              ) : (
                <Badge variant="outline" className="text-positive border-positive/50">Active</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 py-2">
              {isExhausted ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-positive" />
              )}
              <span className="font-medium">
                {isExhausted ? "Falling back to original text" : "Real-time AI active"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              The system automatically uses the source language when credits are unavailable to ensure 100% uptime.
            </p>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs" asChild>
              <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer">
                Lovable Documentation <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs" asChild>
              <a href="https://lovable.dev/settings/billing" target="_blank" rel="noopener noreferrer">
                Workspace Settings <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs font-semibold text-primary" asChild>
              <a href="https://lovable.dev/projects/xseilsdlrcakjevtmcfw/billing" target="_blank" rel="noopener noreferrer">
                Add More Credits <Zap className="h-3 w-3 fill-current" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Recent Translation Errors
            </CardTitle>
            <CardDescription>
              Last 50 events captured by the auto-translator.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={clearLogs} disabled={errors.length === 0}>
            Clear Logs
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading logs...</div>
          ) : errors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground italic border-2 border-dashed rounded-xl">
              No recent translation errors found. System is healthy or no translations attempted.
            </div>
          ) : (
            <div className="relative overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Detail</th>
                    <th className="px-4 py-3">Context</th>
                    <th className="px-4 py-3 text-right">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {errors.map((err, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {format(new Date(err.timestamp), "MMM d, HH:mm:ss", { locale: fr })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={err.type === "error" ? "destructive" : err.type === "credit" ? "secondary" : "outline"}
                          className="text-[10px] uppercase px-1.5 py-0"
                        >
                          {err.type || "unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-medium line-clamp-1 ${err.type === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                          {err.error}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-xs text-muted-foreground truncate">
                          {err.texts ? `"${err.texts.join('", "')}"` : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {err.count || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTranslationMonitor;