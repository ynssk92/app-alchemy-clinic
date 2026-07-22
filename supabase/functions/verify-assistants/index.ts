import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Alert = {
  user_id: string | null;
  user_name: string | null;
  kind: string;
  detail: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // Pull every user_roles row to see who is admin and who is assistant.
    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("user_id, role");
    if (rolesErr) throw rolesErr;

    const flags = new Map<string, { admin: boolean; assistant: boolean }>();
    for (const r of roles || []) {
      const cur = flags.get(r.user_id) || { admin: false, assistant: false };
      if (r.role === "admin") cur.admin = true;
      if (r.role === "assistant") cur.assistant = true;
      flags.set(r.user_id, cur);
    }

    const assistantIds = [...flags.entries()]
      .filter(([, v]) => v.assistant)
      .map(([id]) => id);

    // Profiles lookup for names
    const { data: profiles } = assistantIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", assistantIds)
      : { data: [] as { id: string; full_name: string | null }[] };
    const nameOf = (id: string) =>
      profiles?.find((p) => p.id === id)?.full_name || id.slice(0, 8);

    const alerts: Alert[] = [];

    // Drift 1: assistant also admin (least privilege)
    for (const id of assistantIds) {
      if (flags.get(id)?.admin) {
        alerts.push({
          user_id: id,
          user_name: nameOf(id),
          kind: "assistant_also_admin",
          detail: "Assistant account also holds the admin role.",
        });
      }
    }

    // Drift 2: missing profile row
    for (const id of assistantIds) {
      if (!profiles?.some((p) => p.id === id)) {
        alerts.push({
          user_id: id,
          user_name: id.slice(0, 8),
          kind: "missing_profile",
          detail: "Assistant has no matching profile row.",
        });
      }
    }

    // Drift 3: table health — appointments reachable?
    const { error: apptErr } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true });
    if (apptErr) {
      alerts.push({
        user_id: null,
        user_name: null,
        kind: "appointments_unreachable",
        detail: apptErr.message,
      });
    }

    // Drift 4: table health — contact_messages reachable?
    const { error: msgErr } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true });
    if (msgErr) {
      alerts.push({
        user_id: null,
        user_name: null,
        kind: "messages_unreachable",
        detail: msgErr.message,
      });
    }

    // Deduplicate against alerts created in the last 24h (avoid noise)
    let inserted = 0;
    if (alerts.length) {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { data: recent } = await supabase
        .from("assistant_verification_alerts")
        .select("kind, user_id")
        .gte("created_at", since);
      const seen = new Set(
        (recent || []).map((r) => `${r.kind}::${r.user_id ?? ""}`),
      );
      const fresh = alerts.filter(
        (a) => !seen.has(`${a.kind}::${a.user_id ?? ""}`),
      );
      if (fresh.length) {
        const { error: insErr } = await supabase
          .from("assistant_verification_alerts")
          .insert(fresh);
        if (insErr) throw insErr;
        inserted = fresh.length;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        assistants_checked: assistantIds.length,
        drift_detected: alerts.length,
        alerts_inserted: inserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verify-assistants failed", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
