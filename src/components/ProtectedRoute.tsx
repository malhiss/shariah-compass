import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'client' | 'staff' | 'any';
  allowDemo?: boolean;
}

// Routes that demo users can access
const DEMO_ALLOWED_ROUTES = ['/shariah-dashboard', '/dashboard'];

export function ProtectedRoute({ children, requireRole = 'any', allowDemo = true }: ProtectedRouteProps) {
  const { user, role, loading, isDemoUser } = useAuth();
  const location = useLocation();

  if (loading) {
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
    // Still need to have either client or staff role
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

    // Check demo user restrictions
    if (isDemoUser && !allowDemo) {
      return <Navigate to="/shariah-dashboard" replace />;
    }

    // Check if demo user is trying to access restricted routes
    if (isDemoUser) {
      const isAllowedRoute = DEMO_ALLOWED_ROUTES.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
      );
      if (!isAllowedRoute) {
        return <Navigate to="/shariah-dashboard" replace />;
      }
    }

    return <>{children}</>;
  }

  // Check specific role
  if (role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  // Check demo restrictions for specific roles too
  if (isDemoUser && !allowDemo) {
    return <Navigate to="/shariah-dashboard" replace />;
  }

  return <>{children}</>;
}
