-- Drop the restrictive delete policy and create one that allows staff to delete
DROP POLICY IF EXISTS "No one can delete access requests" ON public.access_requests;

CREATE POLICY "Staff can delete access requests"
ON public.access_requests
FOR DELETE
USING (has_role(auth.uid(), 'staff'::app_role));