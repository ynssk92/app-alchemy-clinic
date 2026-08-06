import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  variant?: "ghost" | "outline";
  className?: string;
}

export const LanguageToggle = ({ variant = "ghost", className }: Props) => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "fr").slice(0, 2).toUpperCase();

  const change = (lng: "fr" | "en") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("ladune_lang", lng);
    document.documentElement.lang = lng;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={`gap-1.5 font-semibold ${className ?? ""}`} title="# ROLE

You are a Senior React + TypeScript + Supabase Architect.

Your mission is to completely fix the authentication redirect loop and role routing without breaking any existing functionality.

====================================================

PROBLEM TO FIX

====================================================

Currently after login:

- Patient logs in

→ application keeps redirecting between:

Profile Page ↔ Patient Dashboard

- Doctor logs in

→ application keeps redirecting between:

Profile Page ↔ Doctor Dashboard

- Admin sometimes experiences the same issue.

This creates an infinite redirect loop.

====================================================

DO NOT CHANGE

====================================================

❌ Do NOT redesign the UI.

❌ Do NOT modify the database schema.

❌ Do NOT remove any existing features.

❌ Do NOT modify appointments, patients, doctors or admin logic.

Only fix authentication and routing.

====================================================

TASKS

====================================================

1.

Inspect every redirect executed after login.

Search for:

- useEffect()

- navigate()

- router.push()

- redirect()

- ProtectedRoute

- AuthGuard

- RoleGuard

- ProfileGuard

- Dashboard redirect

- Session listeners

Remove duplicate redirects.

There must be ONE source of truth.

----------------------------------------------------

2.

After login:

Read authenticated user.

Then fetch user profile from Supabase.

Get:

role

Possible roles:

patient

doctor

admin

Do NOT redirect before role is loaded.

Wait until profile finishes loading.

----------------------------------------------------

3.

Create ONE Auth Provider responsible for:

- current user

- loading state

- role

- session

No page should fetch the role individually.

Every page must consume AuthContext.

----------------------------------------------------

4.

Create loading protection.

Pseudo flow:

Loading session...

↓

Loading profile...

↓

Role loaded...

↓

Navigate once.

Never navigate while loading.

----------------------------------------------------

5.

Prevent redirect loops.

If user already is inside his dashboard

DO NOTHING.

Example:

Patient already on

/dashboard/patient

Don't redirect again.

Doctor already on

/dashboard/doctor

Don't redirect again.

Admin already on

/dashboard/admin

Don't redirect again.

----------------------------------------------------

6.

Create clean role routing.

Patient

→ /dashboard/patient

Doctor

→ /dashboard/doctor

Admin

→ /dashboard/admin

No other redirects.

----------------------------------------------------

7.

Profile page must NOT auto redirect.

It only displays user information.

If user manually opens profile

Stay there.

No automatic navigation.

----------------------------------------------------

8.

Dashboard pages must never redirect to Profile.

Remove any logic like:

if profile incomplete

navigate(\"/profile\")

Instead:

Show a dismissible warning banner:

\"Please complete your profile.\"

with

Complete Profile

button.

Never force navigation.

----------------------------------------------------

9.

Route Guards

Patient cannot access

/dashboard/admin

/dashboard/doctor

Doctor cannot access

/dashboard/admin

/dashboard/patient

Admin can access everything allowed by policy.

Unauthorized users

→ redirect once to their own dashboard.

----------------------------------------------------

10.

Create redirect utility.

Example:

getDashboardByRole(role)

patient

→ /dashboard/patient

doctor

→ /dashboard/doctor

admin

→ /dashboard/admin

Use this helper everywhere.

No duplicated routing logic.

----------------------------------------------------

11.

Prevent multiple useEffect executions.

Audit every dependency array.

Avoid:

navigate()

inside effects that rerun after every render.

Memoize values when necessary.

----------------------------------------------------

12.

After successful login:

Display ONE success toast.

Patient:

\"Welcome back! Redirecting to your Patient Dashboard.\"

Doctor:

\"Welcome back! Redirecting to your Doctor Dashboard.\"

Admin:

\"Welcome back! Redirecting to your Admin Dashboard.\"

Toast should appear once only.

----------------------------------------------------

13.

Handle browser refresh.

If user refreshes:

Remain inside same dashboard.

Do NOT go back to login.

Do NOT go to profile.

Do NOT create redirect loops.

----------------------------------------------------

14.

If session expires:

Logout safely.

Redirect once to:

/auth

Show:

\"Your session has expired. Please sign in again.\"

----------------------------------------------------

15.

Use browser history correctly.

All automatic redirects must use:

replace:true

instead of push

to avoid history loops.

----------------------------------------------------

16.

Final testing

Verify:

✓ Patient login

Login

↓

Patient Dashboard

✓ Doctor login

Login

↓

Doctor Dashboard

✓ Admin login

Login

↓

Admin Dashboard

✓ Refresh page

Dashboard stays.

✓ Logout

Returns to Auth.

✓ No infinite redirects.

✓ No console errors.

✓ No React warnings.

✓ No broken routes.

====================================================

EXPECTED RESULT

====================================================

The authentication flow must become stable, predictable and professional.

One login.

One redirect.

Correct dashboard.

No Profile loop.

No infinite navigation.

No duplicated redirects.

No broken existing features.

Keep all current database connections and application logic intact.">
          <Globe className="w-4 h-4" />
          {current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem] bg-popover">
        <DropdownMenuItem onClick={() => change("fr")} className={current === "FR" ? "font-semibold text-primary" : ""}>
          🇫🇷 Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => change("en")} className={current === "EN" ? "font-semibold text-primary" : ""}>
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
