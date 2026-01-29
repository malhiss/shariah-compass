-- Remove policy that exposes IP addresses and user agents to end users
-- Only staff should have access to activity logs for security investigations
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;