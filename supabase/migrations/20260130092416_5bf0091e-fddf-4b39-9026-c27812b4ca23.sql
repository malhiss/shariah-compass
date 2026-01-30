-- Create feedback table for client submissions
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own feedback
CREATE POLICY "Users can submit their own feedback"
ON public.feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Staff can view all feedback
CREATE POLICY "Staff can view all feedback"
ON public.feedback
FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role));

-- Staff can delete feedback
CREATE POLICY "Staff can delete feedback"
ON public.feedback
FOR DELETE
USING (has_role(auth.uid(), 'staff'::app_role));