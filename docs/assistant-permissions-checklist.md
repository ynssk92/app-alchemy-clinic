# Assistant Role — Permissions Test Checklist

Use this checklist to confirm that a user with the **assistant** role has exactly the access they need — no more, no less.

## Setup

- [ ] Create (or pick) a test user, e.g. `assistant.test@ladune.example`.
- [ ] Sign in as an **admin**, go to **Admin → Patients**, find the user, and click **Grant Assistant**.
- [ ] Sign out. Sign back in as the assistant test user.
- [ ] Confirm the email is verified (otherwise `/admin` redirects to `/verify-email`).

---

## ✅ Must be ALLOWED

### Navigation & layout
- [ ] `/admin` loads without redirecting to `/` or `/auth`.
- [ ] Sidebar shows only: **Overview**, **Appointments**, **Messages**.
- [ ] Header avatar + name resolve to the assistant's profile (not their email).
- [ ] Quick Actions dropdown only lists items relevant to appointments & messages.
- [ ] Notifications bell shows new appointment + new message events in real time.

### Appointments (`/admin/appointments`)
- [ ] Page loads and lists every appointment (not just their own).
- [ ] Filters, search, and pagination work.
- [ ] Can change an appointment's **status** (e.g. pending → confirmed → completed / cancelled) and the change persists after refresh.
- [ ] Can open an appointment's detail view.
- [ ] Realtime: booking a new appointment from another browser makes it appear without refresh.

### Messages (`/admin/messages`)
- [ ] Inbox loads and lists every contact message.
- [ ] Can open a message and read the full body.
- [ ] Can mark a message as read / replied (status update persists).
- [ ] Realtime: submitting the public contact form makes the new message appear without refresh.

---

## 🚫 Must be BLOCKED

Attempt each of the following as the assistant. Every one should redirect away (to `/admin` or `/`) or return a permission error — never render the page or mutate data.

### Admin-only pages
- [ ] `/admin/doctors` — blocked.
- [ ] `/admin/patients` — blocked (cannot grant/revoke roles).
- [ ] `/admin/catalog` (clinics & specialties) — blocked.
- [ ] `/admin/clinic-audit` — blocked.
- [ ] `/admin/blog` — blocked.

### Admin-only actions (attempted via UI or direct API call)
- [ ] Cannot create, edit, or delete **doctors**.
- [ ] Cannot create, edit, or delete **clinics** or **specialties**.
- [ ] Cannot create, edit, or delete **blog posts**.
- [ ] Cannot insert into **admin_invites** or promote any user to admin/assistant.
- [ ] Cannot read the **clinic_audit_log** table.
- [ ] Cannot delete appointments or contact messages (only status updates are permitted).

### Sidebar / quick actions
- [ ] Doctors, Patients, Clinics, Blog links are **not** rendered in the sidebar.
- [ ] Admin-only entries are **not** rendered in the Quick Actions menu.

---

## Regression sign-off

- [ ] Signed in as **admin**, all admin-only pages still load and mutate correctly.
- [ ] Signed in as **patient**, `/admin` still redirects to `/` and the patient can only see their own bookings on `/dashboard`.
- [ ] Revoking the assistant role from the test user immediately blocks `/admin/appointments` and `/admin/messages` on next navigation.

---

**Last verified:** _fill in date + tester name after each run._
