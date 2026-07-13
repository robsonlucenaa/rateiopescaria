ALTER TABLE public.fishing_trips ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can create their own trips" ON public.fishing_trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.fishing_trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON public.fishing_trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON public.fishing_trips;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fishing_trips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fishing_trips TO authenticated;
GRANT ALL ON public.fishing_trips TO service_role;

CREATE POLICY "Public can view trips" ON public.fishing_trips FOR SELECT USING (true);
CREATE POLICY "Public can create trips" ON public.fishing_trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update trips" ON public.fishing_trips FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete trips" ON public.fishing_trips FOR DELETE USING (true);