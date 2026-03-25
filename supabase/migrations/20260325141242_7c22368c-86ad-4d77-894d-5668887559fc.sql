-- Create fishing_trips table with user_id for ownership
CREATE TABLE public.fishing_trips (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fishing_trips ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own trips
CREATE POLICY "Users can view their own trips"
  ON public.fishing_trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips"
  ON public.fishing_trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
  ON public.fishing_trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
  ON public.fishing_trips FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups by user
CREATE INDEX idx_fishing_trips_user_id ON public.fishing_trips(user_id);

-- Trigger to auto-update last_updated
CREATE OR REPLACE FUNCTION public.update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_fishing_trips_last_updated
  BEFORE UPDATE ON public.fishing_trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_updated_column();