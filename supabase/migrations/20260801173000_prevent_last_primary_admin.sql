-- Keep at least one system administrator even when two staff changes arrive concurrently.
CREATE OR REPLACE FUNCTION public.prevent_removing_last_primary_admin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'مدير النظام'
    AND (TG_OP = 'DELETE' OR NEW.role IS DISTINCT FROM 'مدير النظام') THEN
    -- Serialize every operation that could remove a system administrator.
    PERFORM pg_advisory_xact_lock(912731, 45672);

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE role = 'مدير النظام'
        AND id <> OLD.id
    ) THEN
      RAISE EXCEPTION 'At least one primary administrator is required'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_last_primary_admin_update ON public.profiles;
CREATE TRIGGER profiles_prevent_last_primary_admin_update
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_removing_last_primary_admin();

DROP TRIGGER IF EXISTS profiles_prevent_last_primary_admin_delete ON public.profiles;
CREATE TRIGGER profiles_prevent_last_primary_admin_delete
BEFORE DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_removing_last_primary_admin();
