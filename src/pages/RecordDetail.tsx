import { useParams, Link } from 'react-router-dom';
import { useScreeningRecord } from '@/hooks/useScreeningRecords';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RecordHeader } from '@/components/record-detail/RecordHeader';
import { VerdictBar } from '@/components/record-detail/VerdictBar';
import { ScreeningTiles } from '@/components/record-detail/ScreeningTiles';
import { RevenueComposition } from '@/components/record-detail/RevenueComposition';
import { NotHalalRevenue } from '@/components/record-detail/NotHalalRevenue';
import { ClientSummaryTab } from '@/components/record-detail/ClientSummaryTab';
import { MemoSection } from '@/components/record-detail/MemoSection';
import { ArrowLeft, RefreshCw, AlertTriangle, FileText, MessageSquare } from 'lucide-react';

export default function RecordDetail() {
  const { upsertKey } = useParams<{ upsertKey: string }>();
  const { data: record, isLoading, isError, error, refetch } = useScreeningRecord(upsertKey);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Verdict bar skeleton */}
        <Skeleton className="h-20 w-full" />

        {/* Tiles skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Content skeleton */}
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container py-8">
        <Card className="premium-card">
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
    );
  }

  // Not found state
  if (!record) {
    return (
      <div className="container py-8">
        <Card className="premium-card">
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
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* 1) Header - Identity Section */}
      <RecordHeader record={record} />

      {/* 2) Verdict Banner */}
      <VerdictBar record={record} />

      {/* 5) Quantitative Screening (Ratios Card) */}
      <ScreeningTiles record={record} />

      {/* 6) Haram Revenue Overview */}
      <RevenueComposition record={record} />

      {/* 7 & 8) Haram Segments and Composition Tables */}
      <NotHalalRevenue record={record} />

      {/* Tabs for detailed views */}
      <Tabs defaultValue="summary" className="mt-8">
        <TabsList className="bg-muted/30 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger
            value="summary"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="memo"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4 mr-2" />
            Memo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <ClientSummaryTab record={record} />
        </TabsContent>

        <TabsContent value="memo" className="mt-6">
          <MemoSection record={record} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
