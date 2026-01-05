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
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarItems = [
  { path: '/shariah-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/portfolio', label: 'Dividends Purification', icon: Coins },
  { path: '/request', label: 'Request Screening', icon: FileText },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/my-activity', label: 'My Activity', icon: Activity },
];

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavItem = ({ item }: { item: typeof sidebarItems[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    const handleNavClick = () => {
      setMobileOpen(false);
      setCollapsed(true);
    };

    const linkContent = (
      <Link
        to={item.path}
        onClick={handleNavClick}
        className={cn(
          'group relative flex items-center gap-3 rounded-[10px] transition-all duration-200 outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-background',
          collapsed ? 'h-11 w-11 justify-center mx-auto' : 'h-11 px-3',
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
          'shrink-0 transition-colors',
          collapsed ? 'w-5 h-5' : 'w-[20px] h-[20px]',
          active ? 'text-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
        )} />
        
        {!collapsed && (
          <span className={cn(
            'text-[13px] font-medium truncate',
            active && 'text-foreground'
          )}>
            {item.label}
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-72px)]">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-16 lg:top-[72px] left-0 z-50 h-[calc(100vh-4rem)] lg:h-[calc(100vh-72px)] bg-sidebar-background w-[272px]',
            'transition-transform duration-300 ease-in-out',
            // Desktop: slide left when collapsed
            collapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0',
            // Mobile: slide in/out based on mobileOpen
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            // When collapsed on desktop, override to hide
            collapsed && !mobileOpen && '-translate-x-full'
          )}
        >
          {/* Right border */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-sidebar-border" />
          
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className={cn(
              'flex items-center h-14 px-4',
              collapsed ? 'justify-center' : 'justify-between'
            )}>
              {!collapsed && (
                <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest">
                  Platform
                </span>
              )}
              
              {/* Collapse button - desktop only */}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    {collapsed ? (
                      <PanelLeft className="w-4 h-4" />
                    ) : (
                      <PanelLeftClose className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </TooltipContent>
              </Tooltip>
              
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
            <nav className={cn(
              'flex-1 py-2 space-y-1 overflow-y-auto',
              collapsed ? 'px-2' : 'px-3'
            )}>
              {sidebarItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>

            {/* Footer */}
            <div className={cn(
              'p-3 border-t border-sidebar-border',
              collapsed && 'flex justify-center'
            )}>
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    >
                      <HelpCircle className="w-[18px] h-[18px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Help & Support
                  </TooltipContent>
                </Tooltip>
              ) : (
                <a 
                  href="#" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-[13px]"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
              )}
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
    </TooltipProvider>
  );
}
