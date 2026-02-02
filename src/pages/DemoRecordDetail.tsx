import { useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useScreeningRecord } from '@/hooks/useScreeningRecords';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { DemoHeader } from '@/components/DemoHeader';
import { VerdictBar } from '@/components/record-detail/VerdictBar';
import { ScreeningTiles } from '@/components/record-detail/ScreeningTiles';
import { CompanyProfileSection } from '@/components/record-detail/CompanyProfileSection';
import { KeyInsightsSection } from '@/components/record-detail/KeyInsightsSection';
import { HaramRevenueSection } from '@/components/record-detail/HaramRevenueSection';
import { ReferencesSection } from '@/components/record-detail/ReferencesSection';
import { ClientSummaryTab } from '@/components/record-detail/ClientSummaryTab';
import { FindingsTab } from '@/components/record-detail/FindingsTab';

import { ArrowLeft, RefreshCw, AlertTriangle, MessageSquare, BookOpen, ListChecks } from 'lucide-react';

export default function DemoRecordDetail() {
  const { upsertKey } = useParams<{ upsertKey: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const universe = searchParams.get('universe') || 'global';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const { data: record, isLoading, isError, error, refetch } = useScreeningRecord(upsertKey);

  const backUrl = `/demo/dashboard?universe=${universe}&page=${page}`;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DemoHeader onSignOut={handleSignOut} isSigningOut={isSigningOut} />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-6">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-3 sm:gap-4">
              <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 sm:h-8 w-full max-w-[250px]" />
                <Skeleton className="h-4 w-32 sm:w-40" />
              </div>
            </div>
            <Skeleton className="h-16 sm:h-20 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <DemoHeader onSignOut={handleSignOut} isSigningOut={isSigningOut} />
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to load record</h2>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()} className="btn-dalil">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not found state
  if (!record) {
    return (
      <div className="min-h-screen bg-background">
        <DemoHeader onSignOut={handleSignOut} isSigningOut={isSigningOut} />
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Record Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The screening record you're looking for doesn't exist or has been removed.
              </p>
              <Link to={backUrl}>
                <Button variant="outline" className="border-border">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoHeader onSignOut={handleSignOut} isSigningOut={isSigningOut} />
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Section - custom for demo (no sidebar back button) */}
        <div className="mb-6 flex flex-col items-start gap-4">
          <Link 
            to={backUrl}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="px-4 py-3 sm:px-5 sm:py-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {record.ticker || record.Ticker}
            </h1>
            <p className="text-sm text-muted-foreground">
              {record.company_name || record.Company}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Verdict + Ratios in one visual block */}
          <section className="space-y-3 sm:space-y-4">
            <VerdictBar record={record} />
            <ScreeningTiles record={record} />
          </section>

          {/* Company Profile - directly under ratios */}
          <CompanyProfileSection record={record} />

          {/* Revenue Composition - directly under company profile */}
          <HaramRevenueSection record={record} />

          {/* Key Insights - Inline cards */}
          <KeyInsightsSection record={record} />

          {/* Detailed Analysis Tabs */}
          <section>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full flex flex-wrap sm:flex-nowrap justify-start gap-1 bg-muted/20 border border-border p-1 rounded-xl overflow-x-auto">
                <TabsTrigger
                  value="overview"
                  className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 sm:px-6 text-xs sm:text-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Overview</span>
                  <span className="xs:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger
                  value="references"
                  className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 sm:px-6 text-xs sm:text-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">References</span>
                  <span className="xs:hidden">Refs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="findings"
                  className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 sm:px-6 text-xs sm:text-sm"
                >
                  <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Findings
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 sm:mt-6">
                <TabsContent value="overview" className="mt-0">
                  <ClientSummaryTab record={record} />
                </TabsContent>

                <TabsContent value="references" className="mt-0 space-y-4 sm:space-y-6">
                  <ReferencesSection record={record} />
                </TabsContent>

                <TabsContent value="findings" className="mt-0">
                  <FindingsTab record={record} />
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
}
