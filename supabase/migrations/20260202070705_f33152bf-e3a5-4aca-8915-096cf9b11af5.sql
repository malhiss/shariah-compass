-- Drop existing user SELECT policy
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;

-- Create enhanced policy with both user_id AND email validation
CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND auth.email() = user_email
);

-- Also update the INSERT policy to ensure email matches at insert time
DROP POLICY IF EXISTS "Users can submit their own feedback" ON public.feedback;

CREATE POLICY "Users can submit their own feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND auth.email() = user_email
);