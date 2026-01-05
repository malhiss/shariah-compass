import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, LogOut, UserCog, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import invesenseLogo from '@/assets/invesense-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const aboutSections = [
  { path: '/#about', label: 'About Invesense' },
  { path: '/#firm-overview', label: 'Firm Overview' },
  { path: '/#investing-approach', label: 'Investing Approach' },
  { path: '/#screening-approach', label: 'Screening Approach' },
  { path: '/#methodology', label: 'Screening Methodology' },
  { path: '/#leadership', label: 'Leadership' },
];

const protectedNavItems = [
  { path: '/shariah-dashboard', label: 'Dashboard' },
  { path: '/portfolio', label: 'Dividends Purification' },
  { path: '/request', label: 'Request Screening' },
  { path: '/chat', label: 'AI Chat' },
  { path: '/my-activity', label: 'My Activity' },
];

const staffNavItems = [
  { path: '/staff-portal', label: 'Manage Users' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, signOut, loading, isStaff } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const sectionId = path.replace('/#', '');
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return location.pathname === '/' && location.hash === path.replace('/', '');
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src={invesenseLogo} alt="Invesense" className="h-8 w-auto" />
        </Link>
        
        <nav className="hidden lg:flex items-center gap-1">
          {/* About Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                'flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                location.pathname === '/' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}>
                Invesense
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {aboutSections.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link 
                    to={item.path} 
                    onClick={() => handleNavClick(item.path)}
                    className="cursor-pointer"
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Protected Nav Items */}
          {user && role && (
            <>
              {protectedNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg relative',
                    isActive(item.path)
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </Link>
              ))}
              {isStaff && staffNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg relative',
                    isActive(item.path)
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
          
          {!loading && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              {user ? (
                <>
                  <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/50 rounded-md">
                    {role === 'staff' ? 'Staff' : 'Client'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/client-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Client Login
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                    <Link to="/staff-login">
                      <UserCog className="w-4 h-4 mr-2" />
                      Staff
                    </Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </nav>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-slide-up max-h-[80vh] overflow-y-auto">
          <div className="container py-4 space-y-1 px-4">
            {/* About Sections */}
            <div className="pb-3 mb-3 border-b border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">Invesense</p>
              {aboutSections.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="block px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Protected Items */}
            {user && role && (
              <div className="pb-3 mb-3 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">Platform</p>
                {protectedNavItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={cn(
                      'block px-4 py-2.5 rounded-lg transition-colors', 
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {isStaff && staffNavItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={cn(
                      'block px-4 py-2.5 rounded-lg transition-colors', 
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Auth Buttons */}
            <div className="pt-2 space-y-2">
              {user ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out ({role === 'staff' ? 'Staff' : 'Client'})
                </Button>
              ) : (
                <>
                  <Link 
                    to="/client-login" 
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Client Login
                  </Link>
                  <Link 
                    to="/staff-login" 
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCog className="w-4 h-4" />
                    Staff Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
