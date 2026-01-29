-- Ensure only staff can read access_requests data
-- First drop any existing SELECT policy to avoid conflicts
DROP POLICY IF EXISTS "Staff can view all access requests" ON public.access_requests;

-- Create a proper permissive policy for staff-only reads
CREATE POLICY "Staff only reads" ON public.access_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'staff'::app_role));