-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new update policy for users that prevents access_tier modification
-- Users can only update if the access_tier value stays the same
CREATE POLICY "Users can update their own profile except access_tier"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND access_tier = (SELECT access_tier FROM public.profiles WHERE id = auth.uid())
);

-- Allow staff to update any profile (including access_tier)
CREATE POLICY "Staff can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'staff'::app_role));