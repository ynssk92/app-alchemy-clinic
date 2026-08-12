-- 1. Add service_id to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL;

-- 2. Add unique constraint to services to allow idempotent seeding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_clinic_id_name_key') THEN
        ALTER TABLE public.services ADD CONSTRAINT services_clinic_id_name_key UNIQUE (clinic_id, name);
    END IF;
END $$;

-- 3. Seed services catalog
DO $$
DECLARE
    v_clinic_id uuid := 'd2d1ee3f-982b-44c1-8450-a7e5deb53e1c';
    v_cat_consultation uuid;
    v_cat_diagnostic uuid;
    v_cat_hygiene uuid;
    v_cat_prevention uuid;
    v_cat_dental_care uuid;
    v_cat_endodontics uuid;
    v_cat_prosthodontics uuid;
    v_cat_implantology uuid;
    v_cat_orthodontics uuid;
    v_cat_pediatric uuid;
    v_cat_cosmetic uuid;
    v_cat_oral_surgery uuid;
    v_cat_emergency uuid;
BEGIN
    -- Get Category IDs
    SELECT id INTO v_cat_consultation FROM service_categories WHERE name = 'Consultation';
    SELECT id INTO v_cat_diagnostic FROM service_categories WHERE name = 'Diagnostic';
    SELECT id INTO v_cat_hygiene FROM service_categories WHERE name = 'Hygiene';
    SELECT id INTO v_cat_prevention FROM service_categories WHERE name = 'Prevention';
    SELECT id INTO v_cat_dental_care FROM service_categories WHERE name = 'Dental Care';
    SELECT id INTO v_cat_endodontics FROM service_categories WHERE name = 'Endodontics';
    SELECT id INTO v_cat_prosthodontics FROM service_categories WHERE name = 'Prosthodontics';
    SELECT id INTO v_cat_implantology FROM service_categories WHERE name = 'Implantology';
    SELECT id INTO v_cat_orthodontics FROM service_categories WHERE name = 'Orthodontics';
    SELECT id INTO v_cat_pediatric FROM service_categories WHERE name = 'Pediatric Dentistry';
    SELECT id INTO v_cat_cosmetic FROM service_categories WHERE name = 'Cosmetic Dentistry';
    SELECT id INTO v_cat_oral_surgery FROM service_categories WHERE name = 'Oral Surgery';
    SELECT id INTO v_cat_emergency FROM service_categories WHERE name = 'Emergency';

    -- Insert Services
    INSERT INTO public.services (clinic_id, category_id, name, code, description, duration, price, active) VALUES
    (v_clinic_id, v_cat_consultation, 'General Consultation', 'CONS-GEN', 'Comprehensive dental examination', 30, 300, true),
    (v_clinic_id, v_cat_emergency, 'Emergency Dental Consultation', 'CONS-EMG', 'Urgent dental care for pain or trauma', 45, 500, true),
    (v_clinic_id, v_cat_hygiene, 'Dental Cleaning', 'HYG-CLN', 'Professional scaling and polishing', 45, 400, true),
    (v_clinic_id, v_cat_cosmetic, 'Teeth Whitening', 'COS-WHT', 'Professional teeth whitening treatment', 60, 2500, true),
    (v_clinic_id, v_cat_dental_care, 'Dental Filling', 'CARE-FIL', 'Restoration of decayed teeth', 45, 600, true),
    (v_clinic_id, v_cat_endodontics, 'Root Canal Treatment', 'ENDO-RCT', 'Treatment for infected tooth pulp', 90, 1500, true),
    (v_clinic_id, v_cat_oral_surgery, 'Tooth Extraction', 'SURG-EXT', 'Removal of a non-restorable tooth', 45, 500, true),
    (v_clinic_id, v_cat_oral_surgery, 'Wisdom Tooth Extraction', 'SURG-WSD', 'Surgical removal of wisdom teeth', 60, 1200, true),
    (v_clinic_id, v_cat_implantology, 'Dental Implant Consultation', 'IMP-CONS', 'Evaluation for dental implant treatment', 45, 400, true),
    (v_clinic_id, v_cat_implantology, 'Dental Implant Placement', 'IMP-PLACE', 'Surgical placement of dental implant', 90, 8000, true),
    (v_clinic_id, v_cat_prosthodontics, 'Dental Crown', 'PROS-CRN', 'Permanent covering for damaged tooth', 60, 3500, true),
    (v_clinic_id, v_cat_prosthodontics, 'Dental Bridge', 'PROS-BRG', 'Fixed dental restoration for missing teeth', 90, 7000, true),
    (v_clinic_id, v_cat_cosmetic, 'Dental Veneers', 'COS-VEN', 'Custom-made thin shells for aesthetic improvement', 60, 4500, true),
    (v_clinic_id, v_cat_orthodontics, 'Orthodontic Consultation', 'ORTH-CONS', 'Evaluation for braces or aligners', 45, 400, true),
    (v_clinic_id, v_cat_orthodontics, 'Braces Installation', 'ORTH-BRC', 'Fixed orthodontic appliance placement', 120, 15000, true),
    (v_clinic_id, v_cat_orthodontics, 'Invisalign Consultation', 'ORTH-INV', 'Clear aligner treatment evaluation', 45, 400, true),
    (v_clinic_id, v_cat_pediatric, 'Pediatric Dental Consultation', 'PED-CONS', 'Dental care for children', 30, 300, true),
    (v_clinic_id, v_cat_diagnostic, 'Dental X-Ray', 'DIAG-XRAY', 'Digital dental radiography', 15, 200, true),
    (v_clinic_id, v_cat_diagnostic, '3D Dental Scan', 'DIAG-3D', 'Cone beam computed tomography (CBCT)', 30, 1200, true),
    (v_clinic_id, v_cat_hygiene, 'Gum Treatment', 'HYG-GUM', 'Treatment for gingivitis', 45, 500, true),
    (v_clinic_id, v_cat_dental_care, 'Periodontal Treatment', 'CARE-PER', 'Treatment for advanced gum disease', 60, 800, true),
    (v_clinic_id, v_cat_oral_surgery, 'Oral Surgery Consultation', 'SURG-CONS', 'Specialist surgical evaluation', 45, 500, true),
    (v_clinic_id, v_cat_prosthodontics, 'Denture Consultation', 'PROS-DNT', 'Evaluation for removable dentures', 45, 400, true),
    (v_clinic_id, v_cat_prosthodontics, 'Denture Placement', 'PROS-PLACE', 'Fitting of complete or partial dentures', 60, 4000, true),
    (v_clinic_id, v_cat_cosmetic, 'Smile Makeover Consultation', 'COS-SMILE', 'Comprehensive aesthetic treatment plan', 60, 600, true),
    (v_clinic_id, v_cat_consultation, 'Follow-up Visit', 'CONS-FLW', 'Review of ongoing treatment progress', 20, 200, true)
    ON CONFLICT (clinic_id, name) DO NOTHING;
END $$;
