import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";

const defaultHero = {
  badge: "CLINIQUE LA DUNE DENTAIRE",
  heading: "Your smile deserves expert care.",
  highlight: "",
  description: "Advanced dental care, modern technology, and personalized treatment in a comfortable environment.",
  primaryCTA: "BOOK AN APPOINTMENT",
  primaryURL: "/booking",
  secondaryCTA: "DISCOVER OUR CARE",
  secondaryURL: "/soins",
  floatingTitle: "Modern Technology",
  floatingSubtitle: "CLINIC EXPERTISE",
  overlayOpacity: 50,
  videoUrl: "https://app-clinic.lovable.app/__l5e/assets-v1/b0071650-2082-45fc-b971-064a43fda304/hero-bg.mp4"
};

export const HeroSection = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const { page, loading } = usePageContent("home", isPreview);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
      });
    }
  }, [page?.hero_config]);

  if (loading) return <div className="h-[750px] bg-slate-900 animate-pulse" />;

  const hero = { ...defaultHero, ...(page?.hero_config || {}) };
  const overlayOpacity = (hero.overlayOpacity || 40) / 100;

  return (
    <section className="relative w-full h-[700px] md:h-[800px] overflow-hidden bg-slate-900">
      {/* Background Media */}
      {hero.videoUrl ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover z-0"
        >
          <source src={hero.videoUrl} type="video/mp4" />
        </video>
      ) : hero.imageUrl ? (
        <img 
          src={hero.imageUrl} 
          alt="Clinic" 
          className="absolute inset-0 h-full w-full object-cover z-0"
        />
      ) : null}

      {/* Subtle Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, rgba(5, 20, 55, ${overlayOpacity}), rgba(5, 20, 55, ${overlayOpacity + 0.1}))` 
        }} 
      />

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center">
        <div className="max-w-[650px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-6">
              '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

                                            AUDIT AND HARDEN THE EXISTING RBAC BACKEND

I need you to audit and correct the existing users, roles, permissions, invitations, and authorization architecture.

IMPORTANT:

This is a security-sensitive change.

DO NOT delete, drop, truncate, reset, or recreate existing clinical data.

DO NOT break:

- patients
- appointments
- medical records
- prescriptions
- invoices
- messages
- profiles
- authentication
- Google OAuth
- invitations
- existing users

Do NOT create a second competing role/permission system.

Before changing anything, inspect the existing implementation and reuse the current architecture whenever possible.

==================================================

1. SOURCE OF TRUTH

==================================================

Use ONE authorization architecture:

Roles:

public.user_roles

Permission definitions:

public.permissions

Role → permissions:

public.role_permissions

Authorization functions:

- has_role()
- is_admin()
- has_permission()

React:

useAuth()

Do not introduce another role table or permission system.

Database authorization must always be the final authority.

==================================================

2. ROLES

==================================================

The application has exactly:

- admin
- doctor
- assistant
- patient

ADMIN:

Full access to all existing application functionality.

DOCTOR:

Permissions must be configurable by an administrator.

ASSISTANT:

Permissions must be configurable by an administrator.

PATIENT:

Restricted patient-owned access only.

==================================================

3. PERMISSION SYSTEM

==================================================

Audit the existing permissions.

If equivalent permissions already exist, reuse them instead of creating duplicates.

Support granular permissions such as:

patients.view
patients.create
patients.edit
patients.delete
appointments.view
appointments.create
appointments.edit
appointments.delete
medical_records.view
medical_records.create
medical_records.edit
medical_records.delete
prescriptions.view
prescriptions.create
prescriptions.edit
prescriptions.delete
invoices.view
invoices.create
invoices.edit
invoices.delete
messages.view
messages.send
messages.delete
reports.view
reports.create
users.view
users.manage
roles.view
roles.manage
permissions.view
permissions.manage
admin_invites.create
admin_invites.manage
audit_logs.view

If the app already has other valid permissions, preserve them.

Do not overwrite existing custom role_permissions configuration unnecessarily.

==================================================

4. ADMIN

==================================================

Admin must have full access to all current permissions.

Do not implement this by disabling RLS.

Use the existing secure authorization functions.

Admin must be able to:

- manage users
- assign roles
- configure permissions
- create/manage invitations
- access all existing modules
- access role management
- access reports
- access audit/history

==================================================

5. DOCTOR AND ASSISTANT

==================================================

Doctor and Assistant permissions must be stored in role_permissions.

Do NOT hardcode their permissions permanently in React.

An Admin must be able to change which permissions they have.

Example:

Doctor:

patients.view = true
patients.edit = true
medical_records.view = true
medical_records.edit = true
billing.view = false

Assistant:

patients.view = true
appointments.view = true
appointments.edit = true
medical_records.view = false
billing.view = false

These are examples only.

The Admin must control the actual configuration.

==================================================

6. PATIENT SECURITY

==================================================

Patient must have a very limited permission set.

Potential access:

- messages.view
- messages.send
- appointments.view
- appointments.create/request
- profile.view
- profile.edit

Do NOT give patients administrative permissions.

Patients must never have:

users.manage
roles.manage
permissions.manage
admin_invites
reports
administrative billing access
access to another patient's data

IMPORTANT:

A permission such as appointments.view does NOT mean a patient can view every appointment.

Patient access must always use:

permission + ownership

RLS must ensure patients can only access records belonging to themselves according to the application's existing ownership model.

==================================================

7. AUTHORIZATION FUNCTIONS

==================================================

Audit:

has_role()
is_admin()
has_permission()

Harden them using:

SECURITY DEFINER
SET search_path = public

They must use auth.uid().

Never trust role or permission values supplied by the frontend.

has_permission(permission_name) must resolve:

auth.uid()
→ user_roles
→ role_permissions
→ permissions

==================================================

8. USER ROLE SECURITY

==================================================

Only Admin users may modify another user's role.

Users must never be able to modify their own role.

Prevent:

Patient → Admin
Doctor → Admin
Assistant → Admin

through frontend AND backend.

Preserve/harden protection against removing or demoting the last Admin.

If only one Admin exists, they cannot be demoted or removed.

==================================================

9. INVITATIONS

==================================================

Preserve the existing invitation system.

Admin can invite:

- admin
- doctor
- assistant
- patient

Invitation flow:

Admin
→ email + role
→ user authenticates
→ claim_invitation_role()
→ invited role assigned
→ invitation claimed
→ permissions loaded

A user cannot choose their own invitation role.

A pending invitation must be matched using the authenticated verified email.

==================================================

10. MIGRATION SAFETY

==================================================

Use additive/idempotent migrations.

Prefer:

CREATE OR REPLACE FUNCTION
INSERT ... ON CONFLICT DO NOTHING

Do not duplicate existing permissions.

Do not delete existing permission mappings unless there is a confirmed security problem.

Do not modify clinical data.

Do not remove RLS.

Do not make protected tables publicly writable.

==================================================

11. IMPORTANT

==================================================

First inspect the current schema and implementation.

If something already exists and works, EXTEND it.

Do not blindly replace it.

If you discover a potentially destructive or breaking migration, STOP and explain it before applying it.

After implementation, report:

- tables inspected
- functions inspected/changed
- RLS policies inspected/changed
- migrations created
- existing data preserved
            </span>

            <h1 className="text-[34px] sm:text-[42px] md:text-[56px] lg:text-[72px] font-bold tracking-tight text-white leading-[1.1] mb-8">
              {hero.heading}
              {hero.highlight && (
                <>
                  <br />
                  <span className="text-white/60">{hero.highlight}</span>
                </>
              )}
            </h1>
            <p className="max-w-xl text-lg md:text-xl text-white/80 leading-relaxed mb-10">
              {hero.description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Button asChild size="lg" className="h-14 rounded-full px-10 text-lg bg-white text-primary hover:bg-slate-50 shadow-xl shadow-black/20">
                <Link to={hero.primaryURL}>
                  {hero.primaryCTA}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-14 rounded-full px-10 text-lg text-white hover:bg-white/10">
                <Link to={hero.secondaryURL}>
                  {hero.secondaryCTA}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Expertise Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute right-4 bottom-12 md:right-12 md:bottom-20 hidden lg:block"
        >
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/20 max-w-[280px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
              {hero.floatingSubtitle}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">
              {hero.floatingTitle}
            </h3>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-1 w-8 rounded-full bg-primary/10 overflow-hidden">
                  <div className="h-full w-full bg-primary origin-left scale-x-[0.8]" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};