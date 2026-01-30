-- Add explicit command-specific deny policies for login_tokens table
-- This provides defense-in-depth alongside the existing "No direct access" ALL policy

-- Explicit SELECT deny
CREATE POLICY "No one can read login tokens" 
ON public.login_tokens 
FOR SELECT 
USING (false);

-- Explicit INSERT deny (tokens are created via service role in edge functions)
CREATE POLICY "No one can insert login tokens directly" 
ON public.login_tokens 
FOR INSERT 
WITH CHECK (false);

-- Explicit UPDATE deny
CREATE POLICY "No one can update login tokens directly" 
ON public.login_tokens 
FOR UPDATE 
USING (false);

-- Explicit DELETE deny
CREATE POLICY "No one can delete login tokens directly" 
ON public.login_tokens 
FOR DELETE 
USING (false);