import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, FileQuestion, MessageSquare, Menu, X, Info } from 'lucide-react';
import { useState } from 'react';
import invesenseLogo from '@/assets/invesense-logo.png';

const navItems = [
  { path: '/about', label: 'About' },
  { path: '/leadership', label: 'Leadership' },
  { path: '/screen', label: 'Screen' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/request', label: 'Request' },
  { path: '/chat', label: 'AI Chat' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Button className="ml-4 btn-invesense text-primary-foreground" size="sm" asChild>
            <Link to="/screen">Get Started</Link>
          </Button>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border/50 bg-background animate-slide-up">
          <div className="container py-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={cn('block px-4 py-3 rounded-md', location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground')} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
