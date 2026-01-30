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
      <div className="flex h-14 sm:h-16 lg:h-[72px] items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left side: Logo + Demo badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/demo" className="flex items-center transition-opacity hover:opacity-80 shrink-0">
            <img src={dalilLogo} alt="Dalil" className="h-10 sm:h-[58px] lg:h-[69px] w-auto" />
          </Link>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold text-[10px] sm:text-xs px-1.5 sm:px-2.5">
            DEMO
          </Badge>
        </div>
        
        {/* Right side: Feedback (logged in) + Dashboard + Staff Portal for staff + Sign Out */}
        <div className="flex items-center gap-1 sm:gap-2">
          {user && <FeedbackDialog />}
          {isStaff && (
            <Button size="sm" variant="outline" asChild className="h-8 sm:h-9 px-2 sm:px-3">
              <Link to="/staff-portal">
                <Shield className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Staff Portal</span>
              </Link>
            </Button>
          )}
          <Button size="sm" asChild className="btn-dalil h-8 sm:h-9 px-2 sm:px-3">
            <Link to="/demo/dashboard">
              <LayoutDashboard className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
          {onSignOut && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignOut}
              disabled={isSigningOut}
              className="text-muted-foreground hover:text-foreground h-8 sm:h-9 px-2 sm:px-3"
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden md:inline ml-2">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
