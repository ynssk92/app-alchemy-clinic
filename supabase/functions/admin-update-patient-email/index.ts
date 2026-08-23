import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the caller's user object
    const {
      data: { user: caller },
      error: callerError,
    } = await supabaseClient.auth.getUser()

    if (callerError || !caller) {
      throw new Error('Non authentifié')
    }

    // Check if the caller is an admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      throw new Error('Accès refusé: Réservé aux administrateurs')
    }

    const { target_user_id, new_email } = await req.json()
    if (!target_user_id || !new_email) {
      throw new Error('target_user_id et new_email sont requis')
    }

    const cleanEmail = new_email.trim().toLowerCase()

    // Initialize admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Update Auth Email
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      target_user_id,
      { email: cleanEmail, email_confirm: true } // Auto-confirm for admin updates if desired, or let it follow global settings
    )

    if (updateError) {
      throw updateError
    }

    // 2. Sync Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ email: cleanEmail })
      .eq('id', target_user_id)

    if (profileError) {
      console.error('Error syncing profile email:', profileError)
      // We don't throw here to ensure the intake is also tried
    }

    // 3. Sync Intake (if exists)
    const { error: intakeError } = await supabaseAdmin
      .from('patient_intake')
      .update({ email: cleanEmail })
      .eq('user_id', target_user_id)

    if (intakeError) {
      console.error('Error syncing intake email:', intakeError)
    }

    return new Response(
      JSON.stringify({ message: 'Email mis à jour avec succès', user: updateData.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
