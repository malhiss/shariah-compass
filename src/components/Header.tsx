import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, LogOut, UserCog } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import invesenseLogo from '@/assets/invesense-logo.png';

const publicNavItems = [
  { path: '/about', label: 'About' },
  { path: '/leadership', label: 'Leadership' },
];

const protectedNavItems = [
  { path: '/screen', label: 'Screen' },
  { path: '/portfolio', label: 'Dividends Purification' },
  { path: '/request', label: 'Request' },
  { path: '/chat', label: 'AI Chat' },
  { path: '/my-activity', label: 'My Activity' },
  { path: '/shariah-dashboard', label: 'Dashboard' },
];

const staffNavItems = [
  { path: '/staff-portal', label: 'Manage Users' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, signOut, loading, isStaff } = useAuth();

  let navItems = publicNavItems;
  if (user && role) {
    navItems = [...publicNavItems, ...protectedNavItems];
    if (isStaff) {
      navItems = [...navItems, ...staffNavItems];
    }
  }

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src={invesenseLogo} alt="Invesense" className="h-8 w-auto" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg relative',
                location.pathname === item.path 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {item.label}
              {location.pathname === item.path && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}
          
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
          className="md:hidden" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-slide-up">
          <div className="container py-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={cn(
                  'block px-4 py-3 rounded-lg transition-colors', 
                  location.pathname === item.path 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )} 
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-border mt-4 space-y-2">
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
