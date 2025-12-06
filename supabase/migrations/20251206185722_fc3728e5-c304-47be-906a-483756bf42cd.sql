-- Create activity log types enum
CREATE TYPE public.activity_type AS ENUM (
  'login_success',
  'login_failed',
  'logout',
  'user_created',
  'user_updated',
  'user_deleted',
  'password_reset',
  'role_changed',
  'ticker_screening',
  'portfolio_screening',
  'screening_request',
  'ai_chat'
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  activity_type activity_type NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Staff can view all activity logs
CREATE POLICY "Staff can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'staff'));

-- Staff can insert activity logs
CREATE POLICY "Staff can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'staff'));

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);