-- Add partial unique index to ensure only one staff role can exist at database level
-- This provides atomic protection against race conditions in setup-first-staff
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_staff_role ON public.user_roles(role) WHERE role = 'staff';