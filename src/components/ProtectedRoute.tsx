import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DisclaimerGate } from './DisclaimerGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'client' | 'staff' | 'any';
}

export function ProtectedRoute({ children, requireRole = 'any' }: ProtectedRouteProps) {
  const { user, role, loading, roleLoading, disclaimerAccepted, refreshDisclaimerStatus } = useAuth();

  // Wait for both auth AND role to be loaded before making decisions
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-login" replace />;
  }

  // If requireRole is 'any', just check that user is authenticated
  if (requireRole === 'any') {
    if (!role) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-serif font-bold mb-4">Access Pending</h2>
            <p className="text-muted-foreground mb-6">
              Your account has been created but access has not been granted yet. 
              Please contact support to activate your account.
            </p>
            <a 
              href="mailto:support@dalil.com" 
              className="text-primary hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      );
    }

    // Show disclaimer gate if not yet accepted
    if (!disclaimerAccepted) {
      return (
        <DisclaimerGate 
          userId={user.id} 
          onAccepted={() => refreshDisclaimerStatus()} 
        />
      );
    }

    return <>{children}</>;
  }

  // Check specific role
  if (role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  // Show disclaimer gate if not yet accepted
  if (!disclaimerAccepted) {
    return (
      <DisclaimerGate 
        userId={user.id} 
        onAccepted={() => refreshDisclaimerStatus()} 
      />
    );
  }

  return <>{children}</>;
}
