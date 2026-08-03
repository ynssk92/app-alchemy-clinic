import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  doctor_id: z.string().uuid(),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointment_time: z.string().trim().min(3).max(20),
  reason: z.string().trim().min(3).max(1000),
  redirect_to: z.string().trim().url().max(300).optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Données invalides", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const b = parsed.data;
    const email = b.email.toLowerCase();
    const fullName = `${b.first_name} ${b.last_name}`.trim();
    const redirectTo = b.redirect_to ?? `${new URL(req.url).origin}/reset-password`;

    // 1. Resolve or create the auth user
    let userId: string | null = null;
    let isNewAccount = false;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone: b.phone },
    });

    if (created?.user) {
      userId = created.user.id;
      isNewAccount = true;
    } else if (createErr && /already|registered|exists/i.test(createErr.message)) {
      const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (linkErr || !link?.user) {
        console.error("lookup failed", linkErr?.message);
        return json({ error: "Impossible de retrouver votre dossier patient." }, 400);
      }
      userId = link.user.id;
    } else {
      console.error("createUser failed", createErr?.message);
      return json({ error: createErr?.message ?? "Création du compte impossible" }, 400);
    }

    // 2. Atomic booking (profile + appointment + history + notifications + logs)
    const { data: result, error: rpcErr } = await admin.rpc("create_guest_booking", {
      _user_id: userId,
      _first_name: b.first_name,
      _last_name: b.last_name,
      _email: email,
      _phone: b.phone,
      _dob: b.dob ?? null,
      _gender: b.gender ?? null,
      _doctor_id: b.doctor_id,
      _date: b.appointment_date,
      _time: b.appointment_time,
      _reason: b.reason,
    });

    if (rpcErr) {
      console.error("booking rpc failed", rpcErr.message);
      if (isNewAccount && userId) {
        // rollback the freshly created auth user so nothing is left dangling
        await admin.auth.admin.deleteUser(userId);
      }
      return json({ error: rpcErr.message }, 400);
    }

    // 3. Send the set-password / access email (best effort)
    let emailSent = false;
    try {
      const anon = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error: mailErr } = await anon.auth.resetPasswordForEmail(email, { redirectTo });
      emailSent = !mailErr;
      if (mailErr) console.error("password email failed", mailErr.message);
    } catch (e) {
      console.error("password email threw", (e as Error).message);
    }

    return json({ ...(result as Record<string, unknown>), is_new_account: isNewAccount, email_sent: emailSent });
  } catch (e) {
    console.error("guest-booking error", (e as Error).message);
    return json({ error: "Une erreur est survenue. Merci de réessayer." }, 500);
  }
});
