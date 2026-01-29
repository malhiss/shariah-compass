-- Security hardening migration
-- 1. Replace overly permissive INSERT policy on access_requests with rate-limiting constraints
-- The existing policy allows anyone to submit requests which is intentional,
-- but we should add rate limiting and explicit denial for other operations

-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit access requests" ON public.access_requests;

-- Create a new INSERT policy with same behavior but clearer naming
-- Note: Rate limiting should be handled at the application layer (Edge Function)
CREATE POLICY "Public can submit access requests"
ON public.access_requests FOR INSERT
TO public
WITH CHECK (
  status = 'pending' AND
  length(full_name) <= 100 AND
  length(company) <= 200 AND
  length(email) <= 255
);

-- 2. Add staff ability to view profiles for support operations
CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role));

-- 3. Add explicit DENY policies for activity_logs to ensure audit trail integrity
-- These are belt-and-suspenders - RLS already denies these by default
CREATE POLICY "No one can update activity logs"
ON public.activity_logs FOR UPDATE
USING (false);

CREATE POLICY "No one can delete activity logs"
ON public.activity_logs FOR DELETE
USING (false);

-- 4. Add explicit DELETE DENY for profiles to prevent account deletion bypass
CREATE POLICY "No one can delete profiles directly"
ON public.profiles FOR DELETE
USING (false);

-- 5. Add explicit DELETE DENY for access_requests
CREATE POLICY "No one can delete access requests"
ON public.access_requests FOR DELETE
USING (false);