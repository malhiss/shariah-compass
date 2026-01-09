import { useParams, Link } from 'react-router-dom';
import { useScreeningRecord } from '@/hooks/useScreeningRecords';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RecordHeader } from '@/components/record-detail/RecordHeader';
import { VerdictBar } from '@/components/record-detail/VerdictBar';
import { ScreeningTiles } from '@/components/record-detail/ScreeningTiles';
import { KeyInsightsSection } from '@/components/record-detail/KeyInsightsSection';
import { HaramRevenueSection } from '@/components/record-detail/HaramRevenueSection';
import { ReferencesSection } from '@/components/record-detail/ReferencesSection';
import { ClientSummaryTab } from '@/components/record-detail/ClientSummaryTab';
import { StructuredMemoSection } from '@/components/record-detail/StructuredMemoSection';
import { QuantitativeScreenSection } from '@/components/record-detail/QuantitativeScreenSection';
import { DataQualitySection } from '@/components/record-detail/DataQualitySection';
import { AppSidebar } from '@/components/AppSidebar';
import { ArrowLeft, RefreshCw, AlertTriangle, FileText, MessageSquare, PieChart, BookOpen, Calculator } from 'lucide-react';

export default function RecordDetail() {
  const { upsertKey } = useParams<{ upsertKey: string }>();
  const { data: record, isLoading, isError, error, refetch } = useScreeningRecord(upsertKey);

  // Loading state
  if (isLoading) {
    return (
      <AppSidebar>
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
      </AppSidebar>
    );
  }

  // Error state
  if (isError) {
    return (
      <AppSidebar>
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Failed to load record</h2>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()} className="btn-invesense">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppSidebar>
    );
  }

  // Not found state
  if (!record) {
    return (
      <AppSidebar>
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Record Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The screening record you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/shariah-dashboard">
                <Button variant="outline" className="border-border">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppSidebar>
    );
  }

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <RecordHeader record={record} />

      {/* Main Content */}
      <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        {/* Verdict + Ratios in one visual block */}
        <section className="space-y-3 sm:space-y-4">
          <VerdictBar record={record} />
          <ScreeningTiles record={record} />
        </section>

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
                value="revenue"
                className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 sm:px-6 text-xs sm:text-sm"
              >
                <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Revenue Analysis</span>
                <span className="xs:hidden">Revenue</span>
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
                value="memo"
                className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 sm:px-6 text-xs sm:text-sm"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Memo
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 sm:mt-6">
              <TabsContent value="overview" className="mt-0">
                <ClientSummaryTab record={record} />
              </TabsContent>

              <TabsContent value="revenue" className="mt-0 space-y-4 sm:space-y-6">
                <HaramRevenueSection record={record} />
                <QuantitativeScreenSection record={record} />
                <DataQualitySection record={record} />
              </TabsContent>

              <TabsContent value="references" className="mt-0 space-y-4 sm:space-y-6">
                <ReferencesSection record={record} />
              </TabsContent>

              <TabsContent value="memo" className="mt-0">
                <StructuredMemoSection record={record} />
              </TabsContent>
            </div>
          </Tabs>
        </section>
        </div>
      </div>
    </AppSidebar>
  );
}
