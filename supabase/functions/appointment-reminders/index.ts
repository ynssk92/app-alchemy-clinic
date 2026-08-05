import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get appointments that need reminders
    // We look for appointments in the next 72 hours that haven't been notified yet
    const { data: appointments, error: fetchError } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        patient_id,
        doctor_id,
        patients (
          id,
          profile_id,
          profiles (full_name, email)
        ),
        doctors (
          id,
          profile_id,
          profiles (full_name)
        )
      `)
      .eq('status', 'confirmed')
      .gte('appointment_date', new Date().toISOString().split('T')[0])

    if (fetchError) throw fetchError

    const now = new Date()
    const notificationsSent = []

    for (const appt of appointments) {
      const patientProfileId = appt.patients?.profile_id
      if (!patientProfileId) continue

      // 2. Get patient notification settings
      const { data: settings } = await supabaseClient
        .from('notification_settings')
        .select('*')
        .eq('user_id', patientProfileId)
        .maybeSingle()

      const leadTimeHours = settings?.reminder_lead_time_hours || 24
      const apptDate = new Date(`${appt.appointment_date}T${appt.appointment_time}`)
      const diffMs = apptDate.getTime() - now.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)

      // Only notify if within lead time (and not in the past)
      if (diffHours > 0 && diffHours <= leadTimeHours) {
        // Check if already notified (simple check: we could add a notified_at column to appointments)
        // For this MVP, we'll check if a notification with this title was recently sent
        const { data: existingNotif } = await supabaseClient
          .from('app_notifications')
          .select('id')
          .eq('user_id', patientProfileId)
          .ilike('title', '%Rappel de rendez-vous%')
          .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle()

        if (!existingNotif) {
          const title = "Rappel de rendez-vous"
          const message = `Bonjour ${appt.patients.profiles.full_name}, vous avez rendez-vous avec Dr. ${appt.doctors.profiles.full_name} le ${appt.appointment_date} à ${appt.appointment_time}.`

          // Send App DM
          if (settings?.app_dm_enabled !== false) {
            await supabaseClient.from('app_notifications').insert({
              user_id: patientProfileId,
              title,
              message,
              type: 'appointment_reminder'
            })
          }

          // Email logic would go here (requires external provider like Resend or SendGrid)
          // For now, we log it
          if (settings?.email_enabled !== false && appt.patients.profiles.email) {
            console.log(`Email reminder would be sent to ${appt.patients.profiles.email}: ${message}`)
          }

          notificationsSent.push({ appointment_id: appt.id, user_id: patientProfileId })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications_sent: notificationsSent.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
