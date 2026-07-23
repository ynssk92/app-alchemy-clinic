
REVOKE EXECUTE ON FUNCTION public.next_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_invoice(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recalc_invoice_from_items() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recalc_invoice_from_payments() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calc_invoice_item_total() FROM PUBLIC, anon, authenticated;
