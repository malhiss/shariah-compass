import { useParams, Link } from 'react-router-dom';
import { useScreeningRecord } from '@/hooks/useScreeningRecords';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { VerdictActionBox } from '@/components/record-detail/VerdictActionBox';
import { NumericScreenTab } from '@/components/record-detail/NumericScreenTab';
import { HaramBreakdownTab } from '@/components/record-detail/HaramBreakdownTab';
import { EvidenceTab } from '@/components/record-detail/EvidenceTab';
import { QATab } from '@/components/record-detail/QATab';
import { MemoSection } from '@/components/record-detail/MemoSection';
import { ArrowLeft, RefreshCw, AlertTriangle, Calculator, PieChart, FileSearch, ClipboardCheck, FileText } from 'lucide-react';

export default function RecordDetail() {
  const { upsertKey } = useParams<{ upsertKey: string }>();
  const { isStaff } = useAuth();
  const { data: record, isLoading, isError, error, refetch } = useScreeningRecord(upsertKey);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
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
    <div className="container py-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link to="/shariah-dashboard">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Verdict & Action Box - Feature 1 */}
      <VerdictActionBox record={record} />

      {/* Tabs for different views */}
      <Tabs defaultValue="numeric" className="mt-8">
        <TabsList className="bg-muted/30 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger
            value="numeric"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Numeric Screen
          </TabsTrigger>
          <TabsTrigger
            value="haram"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Haram Breakdown
          </TabsTrigger>
          <TabsTrigger
            value="evidence"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileSearch className="w-4 h-4 mr-2" />
            Evidence
          </TabsTrigger>
          <TabsTrigger
            value="memo"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4 mr-2" />
            Memo
          </TabsTrigger>
          {isStaff && (
            <TabsTrigger
              value="qa"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              QA
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="numeric" className="mt-6">
          <NumericScreenTab record={record} />
        </TabsContent>

        <TabsContent value="haram" className="mt-6">
          <HaramBreakdownTab record={record} />
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <EvidenceTab record={record} />
        </TabsContent>

        <TabsContent value="memo" className="mt-6">
          <MemoSection record={record} />
        </TabsContent>

        {isStaff && (
          <TabsContent value="qa" className="mt-6">
            <QATab record={record} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
