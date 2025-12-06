import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { 
  Activity, 
  RefreshCw, 
  LogIn, 
  UserPlus, 
  Trash2, 
  Key, 
  Shield, 
  Search as SearchIcon, 
  PieChart, 
  MessageSquare,
  FileText,
  Clock,
  User,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

const activityTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  login_success: { icon: LogIn, color: 'text-compliant', label: 'Login' },
  login_failed: { icon: AlertCircle, color: 'text-destructive', label: 'Failed Login' },
  logout: { icon: LogIn, color: 'text-muted-foreground', label: 'Logout' },
  user_created: { icon: UserPlus, color: 'text-primary', label: 'User Created' },
  user_updated: { icon: User, color: 'text-warning', label: 'User Updated' },
  user_deleted: { icon: Trash2, color: 'text-destructive', label: 'User Deleted' },
  password_reset: { icon: Key, color: 'text-warning', label: 'Password Reset' },
  role_changed: { icon: Shield, color: 'text-primary', label: 'Role Changed' },
  ticker_screening: { icon: SearchIcon, color: 'text-compliant', label: 'Ticker Screening' },
  portfolio_screening: { icon: PieChart, color: 'text-primary', label: 'Portfolio Screening' },
  screening_request: { icon: FileText, color: 'text-warning', label: 'Screening Request' },
  ai_chat: { icon: MessageSquare, color: 'text-primary', label: 'AI Chat' },
};

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    screenings: 0,
    userActions: 0,
  });

  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: { 
          action: 'get_activity_logs',
          limit: 100,
          activityType: activityFilter !== 'all' ? activityFilter : undefined,
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      const fetchedLogs = response.data.logs || [];
      setLogs(fetchedLogs);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayLogs = fetchedLogs.filter((log: ActivityLog) => 
        new Date(log.created_at) >= today
      ).length;

      const screenings = fetchedLogs.filter((log: ActivityLog) => 
        ['ticker_screening', 'portfolio_screening'].includes(log.activity_type)
      ).length;

      const userActions = fetchedLogs.filter((log: ActivityLog) => 
        ['user_created', 'user_deleted', 'password_reset', 'role_changed'].includes(log.activity_type)
      ).length;

      setStats({
        totalLogs: response.data.total || fetchedLogs.length,
        todayLogs,
        screenings,
        userActions,
      });
    } catch (error: any) {
      toast({
        title: 'Error fetching activity logs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activityFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    const config = activityTypeConfig[type];
    if (!config) return <Activity className="w-4 h-4" />;
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.color}`} />;
  };

  const getActivityBadge = (type: string) => {
    const config = activityTypeConfig[type];
    const label = config?.label || type.replace(/_/g, ' ');
    
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    if (type.includes('screening')) variant = 'default';
    if (type === 'user_deleted' || type === 'login_failed') variant = 'destructive';
    
    return (
      <Badge variant={variant} className="text-xs capitalize">
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <AnimatedSection>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerItem>
            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLogs}</p>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-border hover:border-compliant/30 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-compliant/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-compliant" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayLogs}</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-border hover:border-warning/30 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.screenings}</p>
                  <p className="text-sm text-muted-foreground">Screenings</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="border-border hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.userActions}</p>
                  <p className="text-sm text-muted-foreground">User Actions</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </AnimatedSection>

      {/* Activity Logs Table */}
      <AnimatedSection delay={0.1}>
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="font-serif">Activity Logs</CardTitle>
                <CardDescription>Track all user actions and system events</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="login_success">Logins</SelectItem>
                    <SelectItem value="user_created">User Created</SelectItem>
                    <SelectItem value="user_deleted">User Deleted</SelectItem>
                    <SelectItem value="password_reset">Password Reset</SelectItem>
                    <SelectItem value="role_changed">Role Changed</SelectItem>
                    <SelectItem value="ticker_screening">Ticker Screening</SelectItem>
                    <SelectItem value="portfolio_screening">Portfolio Screening</SelectItem>
                    <SelectItem value="ai_chat">AI Chat</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchLogs} title="Refresh">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity logs found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[60px]">Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="min-w-[300px]">Description</TableHead>
                      <TableHead className="hidden lg:table-cell">Details</TableHead>
                      <TableHead className="w-[120px]">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="group">
                        <TableCell>
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                            {getActivityIcon(log.activity_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {log.user_email?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="text-sm">{log.user_email || 'System'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getActivityBadge(log.activity_type)}
                            </div>
                            <p className="text-sm text-muted-foreground">{log.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              {log.metadata.ticker && (
                                <div>Ticker: <span className="font-mono">{log.metadata.ticker}</span></div>
                              )}
                              {log.metadata.tickers && (
                                <div>Tickers: <span className="font-mono">{log.metadata.tickers.slice(0, 3).join(', ')}{log.metadata.tickers.length > 3 ? '...' : ''}</span></div>
                              )}
                              {log.metadata.created_user_email && (
                                <div>Created: {log.metadata.created_user_email}</div>
                              )}
                              {log.metadata.target_user_email && (
                                <div>Target: {log.metadata.target_user_email}</div>
                              )}
                              {log.metadata.new_role && (
                                <div>Role: {log.metadata.previous_role || 'none'} → {log.metadata.new_role}</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}
