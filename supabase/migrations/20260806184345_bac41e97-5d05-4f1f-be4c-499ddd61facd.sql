
-- Fix: Move extensions out of public if they still exist there
DO $$
DECLARE
    ext RECORD;
BEGIN
    FOR ext IN 
        SELECT extname 
        FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE n.nspname = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext.extname);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not move extension %: %', ext.extname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Fix: Explicitly revoke execute from public for SD functions
-- This is a broad sweep to clear the linter warnings
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- Grant back only what is necessary
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_guest_booking(uuid,text,text,text,text,date,text,uuid,date,text,text) TO service_role;

-- Normal functions (Security Invoker) can be granted back to public/authenticated
-- Most trigger functions are SD, but if they aren't, they are fine.
-- We'll grant back specifically those used by clients.
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated, service_role;
