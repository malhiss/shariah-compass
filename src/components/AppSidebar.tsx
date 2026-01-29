import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Coins, 
  FileText, 
  MessageSquare, 
  Activity,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { HelpSupportDialog } from './HelpSupportDialog';
import { useAuth } from '@/hooks/useAuth';

const allSidebarItems = [
  { path: '/shariah-dashboard', label: 'Dashboard', icon: LayoutDashboard, demoVisible: true },
  { path: '/portfolio', label: 'Dividends Purification', icon: Coins, demoVisible: false },
  { path: '/request', label: 'Request Screening', icon: FileText, demoVisible: false },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare, demoVisible: false },
  { path: '/my-activity', label: 'My Activity', icon: Activity, demoVisible: false },
];

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemoUser } = useAuth();

  // Filter sidebar items based on user access tier
  const sidebarItems = allSidebarItems.filter(item => !isDemoUser || item.demoVisible);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavItem = ({ item }: { item: typeof sidebarItems[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'group relative flex items-center gap-3 rounded-[10px] transition-all duration-200 outline-none h-11 px-3',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background',
          active
            ? 'bg-sidebar-accent text-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )}
      >
        {/* Active indicator bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
        )}
        
        <Icon className={cn(
          'shrink-0 transition-colors w-[20px] h-[20px]',
          active ? 'text-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
        )} />
        
        <span className={cn(
          'text-[13px] font-medium truncate',
          active && 'text-foreground'
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-72px)]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - fixed on mobile, static on desktop */}
      <aside
        className={cn(
          'bg-sidebar-background shrink-0 relative w-[272px]',
          // Mobile: fixed overlay with slide animation
          'fixed lg:relative top-16 lg:top-0 left-0 z-50 lg:z-auto',
          'h-[calc(100vh-4rem)] lg:h-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'transition-transform duration-300 ease-in-out lg:transition-none'
        )}
      >
        {/* Inner container */}
        <div className="w-[272px] h-full flex flex-col lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)]">
          {/* Right border */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-sidebar-border" />
          
          {/* Header */}
          <div className="flex items-center justify-between h-14 px-4">
            <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest">
              Platform
            </span>
            
            {/* Close button - mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 space-y-1 overflow-y-auto px-3">
            {sidebarItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            <HelpSupportDialog 
              trigger={
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-[13px]">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </button>
              }
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-16 z-30 flex items-center gap-3 h-12 px-4 bg-background/95 backdrop-blur-sm border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-foreground truncate">
            {sidebarItems.find(item => isActive(item.path))?.label || 'Platform'}
          </span>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
