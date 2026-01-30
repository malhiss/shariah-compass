-- Create a SECURITY DEFINER function to validate and consume login tokens
-- This allows secure token validation without exposing the login_tokens table
CREATE OR REPLACE FUNCTION public.validate_login_token(token_value TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Find and validate the token
  SELECT lt.user_id, lt.email, lt.expires_at, lt.used_at
  INTO token_record
  FROM public.login_tokens lt
  WHERE lt.token = token_value;
  
  -- Check if token exists
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if token is already used
  IF token_record.used_at IS NOT NULL THEN
    RETURN;
  END IF;
  
  -- Check if token is expired
  IF token_record.expires_at < NOW() THEN
    RETURN;
  END IF;
  
  -- Mark token as used
  UPDATE public.login_tokens lt
  SET used_at = NOW()
  WHERE lt.token = token_value;
  
  -- Return user info
  RETURN QUERY SELECT token_record.user_id, token_record.email;
END;
$$;

-- Grant execute permission to authenticated and anon users (needed for login flow)
GRANT EXECUTE ON FUNCTION public.validate_login_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_login_token(TEXT) TO authenticated;