
-- =========================
-- SERVICE CATEGORIES
-- =========================
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
GRANT ALL ON public.service_categories TO service_role;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Billing staff can view service categories" ON public.service_categories
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','view'));
CREATE POLICY "Billing staff can create service categories" ON public.service_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','create'));
CREATE POLICY "Billing staff can update service categories" ON public.service_categories
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','edit'));
CREATE POLICY "Billing staff can delete service categories" ON public.service_categories
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','delete'));

-- =========================
-- SERVICES
-- =========================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  duration INTEGER DEFAULT 30,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Billing staff can view services" ON public.services
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','view'));
CREATE POLICY "Billing staff can create services" ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','create'));
CREATE POLICY "Billing staff can update services" ON public.services
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','edit'));
CREATE POLICY "Billing staff can delete services" ON public.services
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','delete'));

-- =========================
-- INVOICES
-- =========================
CREATE TYPE public.invoice_status AS ENUM ('draft','pending','partially_paid','paid','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash','card','insurance','transfer','online');

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  due NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Billing staff can view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','view'));
CREATE POLICY "Patients view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());
CREATE POLICY "Billing staff create invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','create'));
CREATE POLICY "Billing staff update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','edit'));
CREATE POLICY "Billing staff delete invoices" ON public.invoices
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','delete'));

-- =========================
-- INVOICE ITEMS
-- =========================
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  qty NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access invoice_items via invoice" ON public.invoice_items
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_permission(auth.uid(),'Billing','view')
    OR EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.patient_id = auth.uid())
  );
CREATE POLICY "Billing staff insert invoice_items" ON public.invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','create'));
CREATE POLICY "Billing staff update invoice_items" ON public.invoice_items
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','edit'));
CREATE POLICY "Billing staff delete invoice_items" ON public.invoice_items
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','delete'));

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  reference TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Billing staff view payments" ON public.payments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_permission(auth.uid(),'Billing','view')
    OR EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.patient_id = auth.uid())
  );
CREATE POLICY "Billing staff insert payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','create'));
CREATE POLICY "Billing staff update payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','edit'));
CREATE POLICY "Billing staff delete payments" ON public.payments
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_permission(auth.uid(),'Billing','delete'));

-- =========================
-- INVOICE NUMBERING (INV-YYYY-000001)
-- =========================
CREATE TABLE public.invoice_sequences (
  year INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE ON public.invoice_sequences TO authenticated;
GRANT ALL ON public.invoice_sequences TO service_role;
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct access" ON public.invoice_sequences FOR SELECT TO authenticated USING (false);

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  y INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  n INTEGER;
BEGIN
  INSERT INTO public.invoice_sequences(year, last_number) VALUES (y, 1)
    ON CONFLICT (year) DO UPDATE SET last_number = public.invoice_sequences.last_number + 1
    RETURNING last_number INTO n;
  RETURN 'INV-' || y || '-' || lpad(n::TEXT, 6, '0');
END $$;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.next_invoice_number();
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();

-- =========================
-- AUTO-RECALC ITEM TOTAL + INVOICE TOTALS + STATUS
-- =========================
CREATE OR REPLACE FUNCTION public.calc_invoice_item_total()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.total := ROUND((NEW.qty * NEW.unit_price) - COALESCE(NEW.discount,0) + COALESCE(NEW.tax,0), 2);
  RETURN NEW;
END $$;

CREATE TRIGGER trg_calc_invoice_item_total
  BEFORE INSERT OR UPDATE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.calc_invoice_item_total();

CREATE OR REPLACE FUNCTION public.recalc_invoice(_invoice_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sub NUMERIC(12,2);
  v_disc NUMERIC(12,2);
  v_tax NUMERIC(12,2);
  v_total NUMERIC(12,2);
  v_paid NUMERIC(12,2);
  v_status public.invoice_status;
  v_current public.invoice_status;
BEGIN
  SELECT COALESCE(SUM(qty * unit_price),0), COALESCE(SUM(discount),0), COALESCE(SUM(tax),0)
    INTO v_sub, v_disc, v_tax
  FROM public.invoice_items WHERE invoice_id = _invoice_id;

  v_total := ROUND(v_sub - v_disc + v_tax, 2);

  SELECT COALESCE(SUM(amount),0) INTO v_paid FROM public.payments WHERE invoice_id = _invoice_id;

  IF v_paid > v_total THEN
    RAISE EXCEPTION 'Total paid (%) exceeds invoice total (%)', v_paid, v_total;
  END IF;

  SELECT status INTO v_current FROM public.invoices WHERE id = _invoice_id;

  IF v_current = 'cancelled' THEN
    v_status := 'cancelled';
  ELSIF v_current = 'draft' AND v_paid = 0 THEN
    v_status := 'draft';
  ELSIF v_paid = 0 THEN
    v_status := 'pending';
  ELSIF v_paid < v_total THEN
    v_status := 'partially_paid';
  ELSE
    v_status := 'paid';
  END IF;

  UPDATE public.invoices
     SET subtotal = v_sub,
         discount = v_disc,
         tax = v_tax,
         total = v_total,
         paid = v_paid,
         due = ROUND(v_total - v_paid, 2),
         status = v_status,
         updated_at = now()
   WHERE id = _invoice_id;
END $$;

CREATE OR REPLACE FUNCTION public.trg_recalc_invoice_from_items()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_invoice(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN NULL;
END $$;

CREATE TRIGGER trg_items_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_invoice_from_items();

CREATE OR REPLACE FUNCTION public.trg_recalc_invoice_from_payments()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_invoice(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN NULL;
END $$;

CREATE TRIGGER trg_payments_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_invoice_from_payments();

-- updated_at triggers
CREATE TRIGGER trg_service_categories_updated BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_invoice_items_updated BEFORE UPDATE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX idx_invoices_doctor ON public.invoices(doctor_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_services_category ON public.services(category_id);
