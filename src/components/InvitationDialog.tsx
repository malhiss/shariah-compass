import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, User, Building2, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const invitationSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  company: z.string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface InvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationDialog({ open, onOpenChange }: InvitationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
  });

  const onSubmit = async (data: InvitationFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('access_requests')
        .insert({
          full_name: data.fullName,
          company: data.company,
          email: data.email,
        });

      if (error) {
        console.error('Error submitting access request:', error);
        toast.error('Failed to submit request. Please try again.');
        return;
      }

      // Send notification email to staff (fire and forget - don't block on failure)
      supabase.functions.invoke('notify-access-request', {
        body: {
          fullName: data.fullName,
          company: data.company,
          email: data.email,
        },
      }).catch((notifyError) => {
        console.error('Failed to send notification email:', notifyError);
      });

      setUserName(data.fullName.split(' ')[0]);
      setIsSuccess(true);
      toast.success('Request submitted successfully!');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      reset();
      setIsSuccess(false);
      setUserName('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-compliant/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-8 h-8 text-compliant" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Thank You, {userName}!</h3>
              <p className="text-muted-foreground mb-6">
                Your access request has been submitted. Our team will review your 
                request and send you login credentials via email shortly.
              </p>
              <Button onClick={handleClose} className="btn-dalil">
                Got it!
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <DialogTitle className="text-xl">Request Access</DialogTitle>
                <DialogDescription>
                  Fill in your details and our team will set up your account.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      className="pl-10"
                      {...register('fullName')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder="Enter your company name"
                      className="pl-10"
                      {...register('company')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-dalil h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request Access'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll review your request and get back to you within 24 hours.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
