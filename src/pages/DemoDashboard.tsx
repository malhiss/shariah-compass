import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { ScreeningTable } from "@/components/dashboard/ScreeningTable";
import { getClientFacingRecords } from "@/lib/shariah-api";
import { ChevronLeft, ChevronRight, Loader2, Globe, MapPin, LogOut } from "lucide-react";
import dalilLogo from '@/assets/dalil-logo.png';
import type { ScreeningFilters, Universe } from "@/types/mongodb";

export default function DemoDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  const initialUniverse = (searchParams.get('universe') as Universe) || 'global';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  
  const [universe, setUniverse] = useState<Universe>(initialUniverse);
  const [filters, setFilters] = useState<ScreeningFilters>({
    page: initialPage,
    pageSize: 20,
  });

  // Check auth on mount and listen for changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/demo/login', { replace: true });
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/demo/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/demo', { replace: true });
    } catch {
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['demo-screening-records', universe, filters.page, filters.pageSize, filters.search, filters.finalVerdict, filters.sector],
    queryFn: () => getClientFacingRecords({ ...filters, universe }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    enabled: isAuthenticated === true,
  });

  const handleFiltersChange = (newFilters: ScreeningFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
      pageSize: prev.pageSize ?? 20,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    setSearchParams({ universe, page: String(newPage) });
  };

  const handleUniverseChange = (newUniverse: Universe) => {
    setUniverse(newUniverse);
    setSearchParams({ universe: newUniverse, page: '1' });
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const showLoading = isLoading && !data;

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header with Sign Out */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-16 lg:h-[72px] items-center justify-between px-4 sm:px-6">
          <Link to="/demo" className="flex items-center transition-opacity hover:opacity-80 shrink-0">
            <img src={dalilLogo} alt="Dalil" className="h-[58px] lg:h-[69px] w-auto" />
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-muted-foreground hover:text-foreground"
          >
            {isSigningOut ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Sign Out
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
            Screening Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive Shariah compliance screening for {universe === "gcc" ? "GCC" : "global"} equities.
          </p>
        </div>

        {/* Universe Toggle Only */}
        <div className="flex flex-wrap items-center gap-4 mb-4 sm:mb-6">
          <Tabs value={universe} onValueChange={(v) => handleUniverseChange(v as Universe)}>
            <TabsList className="bg-muted/30">
              <TabsTrigger
                value="global"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global
              </TabsTrigger>
              <TabsTrigger
                value="gcc"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MapPin className="w-4 h-4 mr-2" />
                GCC
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4">
            <DashboardFilters filters={filters} onFiltersChange={handleFiltersChange} viewMode="shariah" />
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {showLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `Showing ${data?.data.length || 0} of ${data?.total || 0} records`
            )}
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <ScreeningTable
              data={data?.data || []}
              loading={showLoading}
              viewMode="shariah"
              universe={universe}
              currentPage={filters.page}
              basePath="/demo/record"
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
