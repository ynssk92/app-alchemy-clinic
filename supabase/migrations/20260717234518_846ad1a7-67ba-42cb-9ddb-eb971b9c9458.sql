
-- Roles enum + user_roles table
create type public.app_role as enum ('admin', 'doctor', 'patient');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins view all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Admins update any profile" on public.profiles for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete profiles" on public.profiles for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile + default 'patient' role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'patient');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Specialties
create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  created_at timestamptz not null default now()
);
grant select on public.specialties to anon, authenticated;
grant insert, update, delete on public.specialties to authenticated;
grant all on public.specialties to service_role;
alter table public.specialties enable row level security;
create policy "Public read specialties" on public.specialties for select to anon, authenticated using (true);
create policy "Admins manage specialties" on public.specialties for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Clinics
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  created_at timestamptz not null default now()
);
grant select on public.clinics to anon, authenticated;
grant insert, update, delete on public.clinics to authenticated;
grant all on public.clinics to service_role;
alter table public.clinics enable row level security;
create policy "Public read clinics" on public.clinics for select to anon, authenticated using (true);
create policy "Admins manage clinics" on public.clinics for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Doctors
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty_id uuid references public.specialties(id) on delete set null,
  clinic_id uuid references public.clinics(id) on delete set null,
  bio text,
  avatar_url text,
  experience_years int default 0,
  rating numeric(2,1) default 5.0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.doctors to anon, authenticated;
grant insert, update, delete on public.doctors to authenticated;
grant all on public.doctors to service_role;
alter table public.doctors enable row level security;
create policy "Public read doctors" on public.doctors for select to anon, authenticated using (true);
create policy "Admins manage doctors" on public.doctors for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger doctors_updated_at before update on public.doctors for each row execute function public.set_updated_at();

-- Appointments
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  appointment_date date not null,
  appointment_time text not null,
  reason text,
  status text not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.appointments to authenticated;
grant all on public.appointments to service_role;
alter table public.appointments enable row level security;
create policy "Patients view own appointments" on public.appointments for select to authenticated using (auth.uid() = patient_id);
create policy "Patients create own appointments" on public.appointments for insert to authenticated with check (auth.uid() = patient_id);
create policy "Patients update own appointments" on public.appointments for update to authenticated using (auth.uid() = patient_id);
create policy "Patients delete own appointments" on public.appointments for delete to authenticated using (auth.uid() = patient_id);
create policy "Admins view all appointments" on public.appointments for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage all appointments" on public.appointments for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger appointments_updated_at before update on public.appointments for each row execute function public.set_updated_at();
