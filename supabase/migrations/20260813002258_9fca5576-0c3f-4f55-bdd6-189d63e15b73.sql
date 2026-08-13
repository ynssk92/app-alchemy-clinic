GRANT EXECUTE ON FUNCTION public.next_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalc_invoice(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trg_recalc_invoice_from_items() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trg_recalc_invoice_from_payments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calc_invoice_item_total() TO authenticated;