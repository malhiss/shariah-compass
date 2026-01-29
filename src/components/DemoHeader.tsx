import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import dalilLogo from '@/assets/dalil-logo.png';

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 lg:h-[72px] items-center justify-between px-4 sm:px-6">
        {/* Left side: Logo only */}
        <Link to="/" className="flex items-center transition-opacity hover:opacity-80 shrink-0">
          <img src={dalilLogo} alt="Dalil" className="h-[58px] lg:h-[69px] w-auto" />
        </Link>
        
        {/* Right side: Single Dashboard button */}
        <Button size="sm" asChild className="btn-dalil">
          <Link to="/dashboard">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>
    </header>
  );
}
