import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { UserPlus, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import invesenseLogo from '@/assets/invesense-logo.png';
import { z } from 'zod';

const setupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export default function SetupStaff() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    setErrors({});
    try {
      setupSchema.parse({ email, password, fullName });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('setup-first-staff', {
        body: { email, password, fullName },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      setIsSuccess(true);
      toast({
        title: 'Staff account created!',
        description: 'You can now login with your credentials.',
      });
    } catch (error: any) {
      toast({
        title: 'Setup failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-compliant/5" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-compliant/30 bg-card/80 backdrop-blur text-center">
            <CardContent className="pt-10 pb-8">
              <div className="w-20 h-20 rounded-full bg-compliant/10 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-compliant" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">Setup Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Your staff account has been created successfully.
              </p>
              <Button className="btn-invesense" onClick={() => navigate('/staff-login')}>
                Go to Staff Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <motion.div 
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={invesenseLogo} alt="Invesense" className="h-10 w-auto mx-auto" />
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-warning/30 bg-warning/5 text-warning text-sm mb-4">
            <Shield className="w-4 h-4" />
            <span>Initial Setup</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Create First Staff Account</h1>
          <p className="text-muted-foreground mt-2">This will be the administrator account</p>
        </div>

        <Card className="border-border bg-card/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-serif">Staff Account Details</CardTitle>
            <CardDescription>
              Enter the details for the first staff administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Admin User"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@invesense.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full btn-invesense" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Staff Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground max-w-sm mx-auto">
          This setup page can only be used once. After creating the first staff account, 
          additional users must be created through the Staff Portal.
        </p>
      </motion.div>
    </div>
  );
}
