-- Create table for one-time login tokens
CREATE TABLE public.login_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_tokens ENABLE ROW LEVEL SECURITY;

-- No one can read tokens directly from client (handled by edge function)
CREATE POLICY "No direct access to login tokens"
ON public.login_tokens
FOR ALL
USING (false);

-- Create index for fast token lookup
CREATE INDEX idx_login_tokens_token ON public.login_tokens(token);
CREATE INDEX idx_login_tokens_expires ON public.login_tokens(expires_at);