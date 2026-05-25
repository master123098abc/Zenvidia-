-- Fix RLS Policies for Zenova

-- Enable RLS if not already enabled
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Creators table policies
-- 1. Anyone can read active creators
CREATE POLICY "Anyone can view active creators"
ON public.creators FOR SELECT
USING (status = 'active');

-- 2. Admins can view all creators (including pending and rejected)
CREATE POLICY "Admins can view all creators"
ON public.creators FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@zenvidia.com');

-- 3. Users can view and update their own creator profile
CREATE POLICY "Users can view own creator profile"
ON public.creators FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own creator profile"
ON public.creators FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Brands table policies
-- 1. Anyone can view brands (needed for public brand profiles or deals)
CREATE POLICY "Anyone can view brands"
ON public.brands FOR SELECT
USING (true);

-- 2. Users can view and update their own brand profile
CREATE POLICY "Users can view own brand profile"
ON public.brands FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own brand profile"
ON public.brands FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Give admins the ability to update all creators
CREATE POLICY "Admins can update creators"
ON public.creators FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@zenvidia.com');
