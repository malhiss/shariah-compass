-- Add defense-in-depth policy allowing users to view only their own feedback
-- This prevents any potential email exposure if other policies are misconfigured
CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() = user_id);