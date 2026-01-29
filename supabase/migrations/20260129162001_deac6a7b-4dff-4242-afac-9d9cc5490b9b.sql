-- Add a restrictive policy requiring authentication as a catch-all security layer
-- This ensures anonymous users can never access activity_logs even if other policies are misconfigured
CREATE POLICY "Require authentication for access" 
ON public.activity_logs 
AS RESTRICTIVE
FOR SELECT 
USING (auth.uid() IS NOT NULL);