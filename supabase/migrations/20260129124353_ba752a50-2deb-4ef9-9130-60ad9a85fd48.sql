-- Create table for demo access requests
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Staff can view all access requests
CREATE POLICY "Staff can view all access requests"
ON public.access_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'staff'));

-- Staff can update access requests
CREATE POLICY "Staff can update access requests"
ON public.access_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'staff'));

-- Anyone can insert access requests (public form)
CREATE POLICY "Anyone can submit access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_access_requests_created_at ON public.access_requests(created_at DESC);