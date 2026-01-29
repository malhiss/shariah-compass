-- Fix activity_logs: only staff can view activity logs (not regular users)
-- Drop the overly permissive authentication-only policy
DROP POLICY IF EXISTS "Require authentication for access" ON public.activity_logs;

-- The existing "Staff can view all activity logs" policy is sufficient
-- Staff-only access is appropriate since activity logs contain sensitive IP/user agent data