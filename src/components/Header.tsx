import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  UserCog, 
  ChevronDown,
  Search,
  User,
  Shield,
  LayoutDashboard,
  Briefcase,
  FileQuestion,
  MessageSquare,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import dalilLogo from '@/assets/dalil-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { HelpSupportDialog } from './HelpSupportDialog';

const sidebarNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portfolio', label: 'Dividends Purification', icon: Briefcase },
  { path: '/request', label: 'Request Screening', icon: FileQuestion },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/my-activity', label: 'My Activity', icon: Activity },
];

const aboutSections = [
  { path: '/about', label: 'About Us' },
  { path: '/about#firm-overview', label: 'Firm Overview' },
  { path: '/about#investing-approach', label: 'Investing Approach' },
  { path: '/about#screening-approach', label: 'Screening Approach' },
  { path: '/about#methodology', label: 'Compliance Status' },
];

// Page titles for breadcrumb display
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/portfolio': 'Dividends Purification',
  '/request': 'Request Screening',
  '/chat': 'AI Chat',
  '/my-activity': 'My Activity',
  '/screen': 'Ticker Screening',
  '/staff-portal': 'Manage Users',
};

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

  const currentPageTitle = pageTitles[location.pathname];
  const isProtectedRoute = Object.keys(pageTitles).includes(location.pathname) || location.pathname.startsWith('/record/');
  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 lg:h-[72px] items-center justify-between px-4 sm:px-6">
        {/* Left side: Hamburger + Logo + Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Hamburger menu - opens navigation drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 border-b border-border">
                <SheetTitle className="flex items-center gap-3">
                  <img src={dalilLogo} alt="Dalil" className="h-[58px] w-auto" />
                </SheetTitle>
              </SheetHeader>
              <nav className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-2">
                  Platform
                </p>
                <div className="space-y-1">
                  {sidebarNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <SheetClose asChild key={item.path}>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive 
                              ? "bg-primary/10 text-primary border-l-2 border-primary" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
                
                {/* Screen a Ticker link */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-2">
                    Quick Actions
                  </p>
                  <SheetClose asChild>
                    <Link
                      to="/screen"
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        location.pathname === '/screen'
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Search className="w-5 h-5" />
                      Screen a Ticker
                    </Link>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          
          {/* Logo next to hamburger */}
          <Link to="/" className="flex items-center transition-opacity hover:opacity-80 shrink-0">
            <img src={dalilLogo} alt="Dalil" className="h-[58px] lg:h-[69px] w-auto" />
          </Link>
          
          {/* Breadcrumb / Page Title - only show on protected routes */}
          {isProtectedRoute && currentPageTitle && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground/40">/</span>
              <span className="text-muted-foreground font-medium">{currentPageTitle}</span>
            </div>
          )}
        </div>
        
        {/* Right side: Utility actions */}
        <div className="hidden lg:flex items-center gap-1">
          {/* About link */}
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/about">About</Link>
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          {/* Utility icons for logged in users */}
          {user && (
            <>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-10 w-10" asChild>
                <Link to="/screen">
                  <Search className="w-[18px] h-[18px]" />
                </Link>
              </Button>
              <HelpSupportDialog />
              
              <div className="w-px h-6 bg-border mx-2" />
            </>
          )}
          
          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden xl:flex flex-col items-start">
                        <span className="text-sm font-medium text-foreground leading-tight">
                          {user.email?.split('@')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {role}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{role} Account</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/my-activity" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Activity
                      </Link>
                    </DropdownMenuItem>
                    {isStaff && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                          Administration
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to="/staff-portal" className="cursor-pointer">
                            <Shield className="w-4 h-4 mr-2" />
                            Manage Users
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link to="/staff-login">
                      <UserCog className="w-4 h-4 mr-2" />
                      Staff
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="btn-dalil">
                    <Link to="/client-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-10 w-10" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border/50 bg-background/98 backdrop-blur-xl animate-slide-up max-h-[80vh] overflow-y-auto">
          <div className="py-4 space-y-1 px-4">
            {/* About Sections */}
            <div className="pb-3 mb-3 border-b border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">About</p>
              {aboutSections.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="block px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-sm"
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Admin items for staff */}
            {user && isStaff && (
              <div className="pb-3 mb-3 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Admin</p>
                <Link 
                  to="/staff-portal" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Manage Users
                </Link>
              </div>
            )}
            
            {/* Auth Buttons */}
            <div className="pt-2 space-y-2">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground capitalize">{role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    to="/client-login" 
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link 
                    to="/staff-login" 
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 border border-border"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCog className="w-4 h-4" />
                    Staff Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
