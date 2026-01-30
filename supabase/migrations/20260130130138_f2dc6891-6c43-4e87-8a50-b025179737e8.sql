-- Add disclaimer acceptance tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN disclaimer_accepted_at TIMESTAMPTZ DEFAULT NULL;