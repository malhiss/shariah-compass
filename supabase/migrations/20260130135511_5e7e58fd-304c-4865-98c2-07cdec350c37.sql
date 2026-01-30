-- Add explicit RESTRICTIVE policies for INSERT, UPDATE, DELETE on user_roles table
-- Only staff can manage user roles (insert, update, delete)

-- Staff can insert new roles
CREATE POLICY "Staff can manage roles - insert"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Staff can update roles
CREATE POLICY "Staff can manage roles - update"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Staff can delete roles
CREATE POLICY "Staff can manage roles - delete"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));