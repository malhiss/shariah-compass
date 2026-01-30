import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Shield, LogOut, Loader2 } from 'lucide-react';
import dalilLogo from '@/assets/dalil-logo.png';
import { useAuth } from '@/hooks/useAuth';
import { FeedbackDialog } from '@/components/FeedbackDialog';

interface DemoHeaderProps {
  onSignOut?: () => void;
  isSigningOut?: boolean;
}

export function DemoHeader({ onSignOut, isSigningOut }: DemoHeaderProps) {
  const { isStaff, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 lg:h-[72px] items-center justify-between px-4 sm:px-6">
        {/* Left side: Logo + Demo badge */}
        <div className="flex items-center gap-3">
          <Link to="/demo" className="flex items-center transition-opacity hover:opacity-80 shrink-0">
            <img src={dalilLogo} alt="Dalil" className="h-[58px] lg:h-[69px] w-auto" />
          </Link>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold">
            DEMO
          </Badge>
        </div>
        
        {/* Right side: Feedback (logged in) + Dashboard + Staff Portal for staff + Sign Out */}
        <div className="flex items-center gap-2">
          {user && <FeedbackDialog />}
          {isStaff && (
            <Button size="sm" variant="outline" asChild>
              <Link to="/staff-portal">
                <Shield className="w-4 h-4 mr-2" />
                Staff Portal
              </Link>
            </Button>
          )}
          <Button size="sm" asChild className="btn-dalil">
            <Link to="/demo/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          {onSignOut && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignOut}
              disabled={isSigningOut}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
