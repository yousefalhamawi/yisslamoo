-- Exposes only the active exchange rate to storefront visitors.
-- Run this in the Supabase SQL editor after deploying the frontend change.

CREATE OR REPLACE FUNCTION public.get_public_exchange_rate()
RETURNS TABLE (
  exchange_rate NUMERIC,
  exchange_rate_updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT settings.exchange_rate, settings.exchange_rate_updated_at
  FROM public.settings
  WHERE settings.id = 'default';
$$;

REVOKE ALL ON FUNCTION public.get_public_exchange_rate() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_exchange_rate() TO anon, authenticated;

-- Make the newly created function available to the REST schema cache immediately.
NOTIFY pgrst, 'reload schema';

-- Allows open storefront sessions to receive exchange-rate changes immediately.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_rel AS publication_relation
      JOIN pg_publication AS publication ON publication.oid = publication_relation.prpubid
      WHERE publication.pubname = 'supabase_realtime'
        AND publication_relation.prrelid = 'public.settings'::regclass
    )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  END IF;
END;
$$;
