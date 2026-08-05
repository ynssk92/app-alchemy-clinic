import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NotificationSimulator() {
  const [loading, setLoading] = useState(false);
  const [patientEmail, setPatientEmail] = useState("");
  const [leadTime, setLeadTime] = useState("24");
  const [results, setResults] = useState<{
    success: boolean;
    logs: string[];
    settings?: any;
    simulatedStatus?: string;
  } | null>(null);

  const runSimulation = async () => {
    if (!patientEmail) {
      toast.error("Please enter a patient email to simulate");
      return;
    }

    setLoading(true);
    setResults(null);
    const logs: string[] = [];

    try {
      logs.push(`🔍 Looking up user account for ${patientEmail}...`);
      
      // Profiles table doesn't have email directly, we look in patients table which DOES have email
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("user_id, first_name, last_name, email")
        .eq("email", patientEmail)
        .maybeSingle();

      if (patientError) throw patientError;
      
      let targetUserId: string | null = null;
      let fullName = "";
      let email = patientEmail;

      if (patient && patient.user_id) {
        targetUserId = patient.user_id;
        fullName = `${patient.first_name} ${patient.last_name}`;
        logs.push(`✅ Found patient record linked to user ID: ${targetUserId}`);
      } else {
        logs.push(`⚠️ No patient record with email ${patientEmail} found.`);
        logs.push(`🔍 Searching profiles by display name or metadata...`);
        
        // Use ILIKE on display_name or full_name as fallback
        const searchStr = patientEmail.split('@')[0];
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .or(`full_name.ilike.%${searchStr}%,display_name.ilike.%${searchStr}%`)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile) {
          targetUserId = profile.id;
          fullName = profile.full_name || "Unknown User";
          logs.push(`✅ Found a matching profile: ${fullName} (${targetUserId})`);
        }
      }

      if (!targetUserId) {
        logs.push(`❌ Could not resolve a user ID for ${patientEmail}. Simulation stopped.`);
        setResults({ success: false, logs });
        return;
      }

      logs.push(`⚙️ Fetching notification settings for user...`);
      const { data: settings, error: settingsError } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (settingsError) throw settingsError;
      
      const userSettings = settings || {
        email_enabled: true,
        app_dm_enabled: true,
        reminder_lead_time_hours: 24,
      };
      
      logs.push(`ℹ️ Settings found: Email=${userSettings.email_enabled}, App DM=${userSettings.app_dm_enabled}, Lead Time=${userSettings.reminder_lead_time_hours}h`);

      const chosenLeadTime = parseInt(leadTime);
      logs.push(`🕒 Simulating an appointment scheduled in ${chosenLeadTime} hours...`);

      const isWithinWindow = chosenLeadTime > 0 && chosenLeadTime <= userSettings.reminder_lead_time_hours;
      
      if (!isWithinWindow) {
        logs.push(`⚠️ This appointment is OUTSIDE the user's lead time window (${userSettings.reminder_lead_time_hours}h).`);
        logs.push(`🔕 No notification would be triggered by the background job.`);
        setResults({ 
          success: true, 
          logs, 
          settings: userSettings, 
          simulatedStatus: "skipped" 
        });
        return;
      }

      logs.push(`🔔 Appointment is WITHIN window. Triggering simulated notification logic...`);
      
      if (userSettings.app_dm_enabled) {
        logs.push(`📱 App DM: "Bonjour ${fullName}, vous avez rendez-vous..." would be sent.`);
      } else {
        logs.push(`🚫 App DM is disabled for this user.`);
      }

      if (userSettings.email_enabled) {
        logs.push(`📧 Email: A reminder would be queued for ${email}.`);
      } else {
        logs.push(`🚫 Email is disabled for this user.`);
      }

      logs.push(`✨ Simulation complete. No real data was modified.`);
      setResults({ 
        success: true, 
        logs, 
        settings: userSettings, 
        simulatedStatus: "notified" 
      });

    } catch (error: any) {
      logs.push(`💥 Error during simulation: ${error.message}`);
      setResults({ success: false, logs });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            <CardTitle>Reminder Simulator</CardTitle>
          </div>
          <CardDescription>
            Test the notification logic for a specific patient without sending real messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Preview Mode</AlertTitle>
            <AlertDescription>
              This tool simulates the logic used by the Edge Function to decide if a reminder should be sent.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient Email</Label>
              <Input 
                placeholder="patient@example.com" 
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Time until appointment (hours)</Label>
              <Input 
                type="number" 
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={runSimulation} 
            disabled={loading}
            className="w-full bg-gradient-primary"
          >
            {loading ? "Running Simulation..." : "Run Test Simulation"}
          </Button>

          {results && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                {results.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                Simulation Results
              </div>
              
              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 font-mono text-sm space-y-1 overflow-auto max-h-[300px]">
                {results.logs.map((log, i) => (
                  <div key={i} className={log.startsWith('❌') || log.startsWith('💥') ? 'text-red-500' : log.startsWith('✅') ? 'text-green-500' : ''}>
                    {log}
                  </div>
                ))}
              </div>

              {results.simulatedStatus === "skipped" && (
                <Alert variant="destructive" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Delivery Skipped</AlertTitle>
                  <AlertDescription>
                    The appointment time is outside the patient's notification window. No reminder would be sent.
                  </AlertDescription>
                </Alert>
              )}

              {results.simulatedStatus === "notified" && (
                <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Delivery Verified</AlertTitle>
                  <AlertDescription>
                    A notification would be successfully triggered for this patient.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
