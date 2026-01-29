-- Add access_tier column to profiles table
-- 'demo' = limited access (dashboard only), 'full' = full client access
ALTER TABLE public.profiles 
ADD COLUMN access_tier text NOT NULL DEFAULT 'full';

-- Add check constraint to ensure valid values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_access_tier_check 
CHECK (access_tier IN ('demo', 'full'));