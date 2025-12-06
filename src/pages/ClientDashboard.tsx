import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { 
  Activity, 
  RefreshCw, 
  Search as SearchIcon, 
  PieChart, 
  MessageSquare,
  FileText,
  Clock,
  TrendingUp,
  BarChart3,
  History,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  activity_type: string;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

const activityTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  ticker_screening: { icon: SearchIcon, color: 'text-compliant', label: 'Ticker Screening' },
  portfolio_screening: { icon: PieChart, color: 'text-primary', label: 'Portfolio Screening' },
  screening_request: { icon: FileText, color: 'text-warning', label: 'Screening Request' },
  ai_chat: { icon: MessageSquare, color: 'text-primary', label: 'AI Chat' },
};

export default function ClientDashboard() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalScreenings: 0,
    tickerScreenings: 0,
    portfolioScreenings: 0,
    aiChats: 0,
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMyActivity = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch activity logs for current user
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (activityFilter !== 'all') {
        query = query.eq('activity_type', activityFilter as any);
      }

      const { data: fetchedLogs, error } = await query;

      if (error) throw error;

      // Cast the logs to our interface type
      const typedLogs = (fetchedLogs || []).map(log => ({
        ...log,
        activity_type: log.activity_type as string,
        metadata: (log.metadata || {}) as Record<string, any>,
      })) as ActivityLog[];

      setLogs(typedLogs);

      // Calculate stats from all user logs (not filtered)
      const { data: allLogs } = await supabase
        .from('activity_logs')
        .select('activity_type')
        .eq('user_id', user.id);

      const tickerScreenings = allLogs?.filter(l => l.activity_type === 'ticker_screening').length || 0;
      const portfolioScreenings = allLogs?.filter(l => l.activity_type === 'portfolio_screening').length || 0;
      const aiChats = allLogs?.filter(l => l.activity_type === 'ai_chat').length || 0;

      setStats({
        totalScreenings: tickerScreenings + portfolioScreenings,
        tickerScreenings,
        portfolioScreenings,
        aiChats,
      });
    } catch (error: any) {
      toast({
        title: 'Error fetching activity',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyActivity();
    }
  }, [user, activityFilter]);

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
    
    let variant: 'default' | 'secondary' | 'outline' = 'secondary';
    if (type.includes('screening')) variant = 'default';
    
    return (
      <Badge variant={variant} className="text-xs capitalize">
        {label}
      </Badge>
    );
  };

  // Get unique tickers from screening activities
  const screenedTickers = [...new Set(
    logs
      .filter(l => l.activity_type === 'ticker_screening' && l.metadata?.ticker)
      .map(l => l.metadata.ticker as string)
  )];

  return (
    <div className="py-8 md:py-12 snap-start">
      <div className="container max-w-7xl">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-4">
                <BarChart3 className="w-4 h-4" />
                <span>My Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Activity History</h1>
              <p className="text-muted-foreground mt-2">Track your screenings, requests, and usage history</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/screen">
                  <SearchIcon className="w-4 h-4 mr-2" />
                  New Screening
                </Link>
              </Button>
              <Button className="btn-invesense" asChild>
                <Link to="/request">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Request
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>

        {/* Stats Cards */}
        <AnimatedSection delay={0.1} className="mb-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StaggerItem>
              <Card className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalScreenings}</p>
                    <p className="text-sm text-muted-foreground">Total Screenings</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-border hover:border-compliant/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-compliant/10 flex items-center justify-center">
                    <SearchIcon className="w-6 h-6 text-compliant" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.tickerScreenings}</p>
                    <p className="text-sm text-muted-foreground">Ticker Screenings</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-border hover:border-warning/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.portfolioScreenings}</p>
                    <p className="text-sm text-muted-foreground">Portfolio Screenings</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-border hover:border-muted-foreground/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.aiChats}</p>
                    <p className="text-sm text-muted-foreground">AI Chats</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </AnimatedSection>

        {/* Tabs for different views */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Activity History
            </TabsTrigger>
            <TabsTrigger value="tickers" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Screened Tickers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <AnimatedSection delay={0.2}>
              <Card className="border-border">
                <CardHeader className="border-b border-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif">Recent Activity</CardTitle>
                      <CardDescription>Your screening and chat history</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={activityFilter} onValueChange={setActivityFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Activities</SelectItem>
                          <SelectItem value="ticker_screening">Ticker Screening</SelectItem>
                          <SelectItem value="portfolio_screening">Portfolio Screening</SelectItem>
                          <SelectItem value="ai_chat">AI Chat</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={fetchMyActivity} title="Refresh">
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
                      <p>No activity yet.</p>
                      <p className="text-sm mt-2">Start by screening a ticker or submitting a request.</p>
                      <div className="flex justify-center gap-3 mt-6">
                        <Button variant="outline" asChild>
                          <Link to="/screen">Screen a Ticker</Link>
                        </Button>
                        <Button className="btn-invesense" asChild>
                          <Link to="/request">Submit Request</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[60px]">Type</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead className="hidden md:table-cell">Details</TableHead>
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
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {getActivityBadge(log.activity_type)}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{log.description}</p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    {log.metadata.ticker && (
                                      <div className="flex items-center gap-2">
                                        <span>Ticker:</span>
                                        <Badge variant="outline" className="font-mono">{log.metadata.ticker}</Badge>
                                        {log.metadata.invesense_classification && (
                                          <Badge 
                                            variant="secondary"
                                            className={
                                              log.metadata.invesense_classification === 'COMPLIANT' 
                                                ? 'bg-compliant/20 text-compliant' 
                                                : log.metadata.invesense_classification === 'NON_COMPLIANT'
                                                  ? 'bg-destructive/20 text-destructive'
                                                  : 'bg-warning/20 text-warning'
                                            }
                                          >
                                            {log.metadata.invesense_classification?.replace(/_/g, ' ')}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                    {log.metadata.tickers && (
                                      <div>
                                        <span>Tickers: </span>
                                        <span className="font-mono">
                                          {log.metadata.tickers.slice(0, 5).join(', ')}
                                          {log.metadata.tickers.length > 5 && ` +${log.metadata.tickers.length - 5} more`}
                                        </span>
                                      </div>
                                    )}
                                    {log.metadata.holdings_count && (
                                      <div>Holdings: {log.metadata.holdings_count}</div>
                                    )}
                                    {log.metadata.total_value && (
                                      <div>Value: ${Number(log.metadata.total_value).toLocaleString()}</div>
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
          </TabsContent>

          <TabsContent value="tickers">
            <AnimatedSection delay={0.2}>
              <Card className="border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="font-serif">Screened Tickers</CardTitle>
                  <CardDescription>All tickers you have screened</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {screenedTickers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tickers screened yet.</p>
                      <Button className="btn-invesense mt-4" asChild>
                        <Link to="/screen">Screen Your First Ticker</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {screenedTickers.map((ticker) => (
                        <Link key={ticker} to={`/screen?ticker=${ticker}`}>
                          <Badge 
                            variant="outline" 
                            className="px-3 py-1.5 text-sm font-mono hover:bg-primary/10 hover:border-primary cursor-pointer transition-colors"
                          >
                            {ticker}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
