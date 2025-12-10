import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, LogOut, UserCog, Settings } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={invesenseLogo} alt="Invesense" className="h-8 w-auto" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                location.pathname === item.path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
          
          {!loading && (
            <div className="flex items-center gap-2 ml-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground px-2">
                    {role === 'staff' ? 'Staff' : 'Client'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="border-border hover:bg-primary/5 hover:border-primary">
                    <Link to="/client-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Client Login
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
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
        
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border/50 bg-background animate-slide-up">
          <div className="container py-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={cn(
                  'block px-4 py-3 rounded-md', 
                  location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
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
                    className="block px-4 py-3 rounded-md bg-primary/10 text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4 inline mr-2" />
                    Client Login
                  </Link>
                  <Link 
                    to="/staff-login" 
                    className="block px-4 py-3 rounded-md text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCog className="w-4 h-4 inline mr-2" />
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
