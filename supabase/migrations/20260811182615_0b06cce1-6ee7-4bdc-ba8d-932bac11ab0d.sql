UPDATE public.legal_pages
SET content = jsonb_set(
  content,
  '{sections}',
  (content->'sections') || jsonb_build_array(
    jsonb_build_object('title','10. Payments and Billing','content','When online payments are enabled, invoices are issued electronically and are available in your patient dashboard. Accepted payment methods include cash, card, bank transfer, insurance coverage and supported online payments. Refunds for prepaid services that were not delivered are processed to the original payment method, typically within fourteen (14) business days of an approved request.'),
    jsonb_build_object('title','11. Suspension and Termination','content','We may suspend or terminate accounts that violate these Terms, submit fraudulent information, abuse staff or other users, or repeatedly miss appointments without notice. Where the law allows, we will notify you of the reason and give you an opportunity to respond. You may close your account at any time from your profile settings.'),
    jsonb_build_object('title','12. Contact Us','content','For questions about these Terms, contact our support team by email or phone, or visit the clinic during opening hours. Contact details are listed at the bottom of this page and on our Contact page.')
  ),
  true
),
last_updated = now(),
version = '1.1.0',
updated_at = now()
WHERE slug = 'terms';

UPDATE public.legal_pages
SET content = jsonb_set(
  content,
  '{sections}',
  (content->'sections') || jsonb_build_array(
    jsonb_build_object('title','8. Cookies','content','We use strictly necessary cookies to keep you signed in and secure, preference cookies to remember settings such as your language, and analytics cookies to understand anonymous usage patterns. You can manage cookies from your browser settings; disabling necessary cookies may break parts of the platform.'),
    jsonb_build_object('title','9. Security Measures','content','We protect your information with encryption in transit and at rest, strong authentication, role-based permissions that limit access strictly to what each staff member needs, audit logs of sensitive actions, and a secured API protected by row-level access rules.'),
    jsonb_build_object('title','10. Contact Our Privacy Officer','content','To exercise your privacy rights or raise a concern, contact our Privacy Officer by email or write to us at the clinic address. We respond to verified requests within thirty (30) days.')
  ),
  true
),
last_updated = now(),
version = '1.1.0',
updated_at = now()
WHERE slug = 'privacy';

CREATE POLICY "Admins can manage legal pages"
ON public.legal_pages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.legal_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_pages TO authenticated;
GRANT ALL ON public.legal_pages TO service_role;