import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Loader2, Eye, ChevronRight, ChevronLeft, TrendingUp, ImageIcon, Calendar } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const COLORS = ["#2563EB", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function AdminGalleryAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [metrics, setMetrics] = useState<any>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), parseInt(timeRange))).toISOString();

      // Fetch all events for the period
      const { data: events, error: eventsError } = await supabase
        .from("gallery_events")
        .select("*, gallery_images(title)")
        .gte("created_at", startDate);

      if (eventsError) throw eventsError;

      // Process metrics
      const totalEvents = events.length;
      const opens = events.filter(e => e.event_type === "open").length;
      const nexts = events.filter(e => e.event_type === "next").length;
      const prevs = events.filter(e => e.event_type === "previous").length;
      const navigation = nexts + prevs;

      // Top Images
      const imageMap = new Map();
      events.forEach(e => {
        if (!e.image_id) return;
        const title = e.gallery_images?.title || "Unknown";
        const current = imageMap.get(e.image_id) || { title, count: 0 };
        imageMap.set(e.image_id, { ...current, count: current.count + 1 });
      });

      const topImages = Array.from(imageMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Event distribution by type
      const typeData = [
        { name: "Opens", value: opens },
        { name: "Next", value: nexts },
        { name: "Previous", value: prevs }
      ];

      // Daily engagement
      const dailyMap = new Map();
      for (let i = 0; i <= parseInt(timeRange); i++) {
        const date = format(subDays(new Date(), i), "MMM dd");
        dailyMap.set(date, 0);
      }

      events.forEach(e => {
        const date = format(new Date(e.created_at), "MMM dd");
        if (dailyMap.has(date)) {
          dailyMap.set(date, dailyMap.get(date) + 1);
        }
      });

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .reverse();

      setMetrics({
        totalEvents,
        opens,
        navigation,
        topImages,
        typeData,
        dailyData,
        engagementRate: opens > 0 ? ((navigation / opens) * 100).toFixed(1) : 0
      });

    } catch (error) {
      console.error("Error fetching gallery metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  if (loading && !metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gallery Engagement</h1>
          <p className="text-sm text-muted-foreground">
            Analyze how patients interact with your clinic gallery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" /> Total Views
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{metrics?.opens}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" /> Navigations
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{metrics?.navigation}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Engagement Rate
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{metrics?.engagementRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-slate-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-500" /> Total Events
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{metrics?.totalEvents}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
            <CardDescription>Daily interactions over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563EB" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interaction Types */}
        <Card>
          <CardHeader>
            <CardTitle>Interaction Types</CardTitle>
            <CardDescription>Breakdown of gallery actions</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics?.typeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Images */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Most Popular Images</CardTitle>
            <CardDescription>Images with the highest interaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {metrics?.topImages.map((img: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{img.title}</span>
                    <span>{img.count} interactions</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${(img.count / metrics.topImages[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {metrics?.topImages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No interaction data available for this period.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
