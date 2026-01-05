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
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
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
          'fixed lg:sticky top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-sidebar-background border-r border-sidebar-border transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'flex items-center h-14 border-b border-sidebar-border px-4',
            collapsed ? 'justify-center' : 'justify-between'
          )}>
            {!collapsed && (
              <span className="font-semibold text-sidebar-foreground text-sm">Platform</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive(item.path)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-sidebar-border">
              <p className="text-xs text-sidebar-foreground/60">
                Need help? Contact support
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-16 z-30 flex items-center gap-3 h-12 px-4 bg-background border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground truncate">
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
