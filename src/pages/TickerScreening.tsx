import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MethodologyCard } from '@/components/MethodologyCard';
import { RatioDisplay } from '@/components/RatioDisplay';
import { screenTicker } from '@/lib/api';
import { getStatusColor, getStatusLabel } from '@/types/screening';
import type { TickerScreeningResponse } from '@/types/screening';
import { Search, Loader2, Scale, AlertTriangle, Calculator, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TickerScreening() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticker, setTicker] = useState(searchParams.get('ticker') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TickerScreeningResponse | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    const normalizedTicker = ticker.trim().toUpperCase();
    setLoading(true);
    setResult(null);

    try {
      const data = await screenTicker(normalizedTicker);
      setResult(data);
      setSearchParams({ ticker: normalizedTicker });
    } catch (error) {
      console.error('Screening error:', error);
      toast({
        title: 'Screening Failed',
        description: error instanceof Error ? error.message : 'Failed to screen ticker',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            Screen a Ticker
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter a stock symbol to check its Shariah compliance status
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter ticker symbol (e.g., NVDA, AAPL)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="pl-10 h-12 text-lg"
                  disabled={loading}
                />
              </div>
              <Button type="submit" size="lg" disabled={loading || !ticker.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Screening...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Screen
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Security Info */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-serif">
                      {result.security.ticker}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground">
                      {result.security.company || 'Unknown Company'}
                    </p>
                    {(result.security.sector || result.security.industry) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[result.security.sector, result.security.industry].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Methodology Tabs */}
            <Tabs defaultValue="invesense" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="invesense" className="flex items-center gap-2 py-3">
                  <Scale className="w-4 h-4" />
                  <span className="hidden sm:inline">Invesense</span>
                </TabsTrigger>
                <TabsTrigger value="autobanned" className="flex items-center gap-2 py-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">Auto-banned</span>
                </TabsTrigger>
                <TabsTrigger value="numeric" className="flex items-center gap-2 py-3">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Numeric</span>
                </TabsTrigger>
              </TabsList>

              {/* Invesense Tab */}
              <TabsContent value="invesense" className="mt-6">
                <MethodologyCard
                  title="Invesense Methodology"
                  description="Comprehensive Shariah screening with qualitative and quantitative analysis"
                  status={getStatusColor(result.invesense.classification, null, result.invesense.available)}
                  statusLabel={getStatusLabel(result.invesense.classification, null, result.invesense.available)}
                  available={result.invesense.available}
                >
                  <div className="space-y-6">
                    {/* Ratios */}
                    <div className="grid sm:grid-cols-3 gap-6">
                      <RatioDisplay
                        label="Debt Ratio"
                        value={result.invesense.debtRatio}
                        threshold={33}
                      />
                      <RatioDisplay
                        label="Cash + Investments"
                        value={result.invesense.cashInvRatio}
                        threshold={33}
                      />
                      <RatioDisplay
                        label="NPIN Ratio"
                        value={result.invesense.npinRatio}
                        threshold={5}
                      />
                    </div>

                    {/* Purification */}
                    {result.invesense.purificationRequired && (
                      <div className="p-4 rounded-lg bg-compliant-purification/10 border border-compliant-purification/30">
                        <p className="font-medium text-compliant-purification">
                          Purification Required: {result.invesense.purificationPctRecommended?.toFixed(2)}%
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This percentage of dividends/gains should be donated to charity
                        </p>
                      </div>
                    )}

                    {/* Key Drivers */}
                    {result.invesense.keyDrivers?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Drivers</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {result.invesense.keyDrivers.map((driver, i) => (
                            <li key={i}>{driver}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Summary */}
                    {result.invesense.shariahSummary && (
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.invesense.shariahSummary}
                        </p>
                      </div>
                    )}

                    {/* QA Issues */}
                    {result.invesense.qaIssues?.length > 0 && (
                      <div className="p-4 rounded-lg bg-muted">
                        <h4 className="font-semibold mb-2 text-sm">QA Notes</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                          {result.invesense.qaIssues.slice(0, 5).map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </MethodologyCard>
              </TabsContent>

              {/* Auto-banned Tab */}
              <TabsContent value="autobanned" className="mt-6">
                <MethodologyCard
                  title="Auto-banned Methodology"
                  description="Security type and industry classification screening"
                  status={getStatusColor(null, result.autoBanned.status, result.autoBanned.available)}
                  statusLabel={getStatusLabel(null, result.autoBanned.status, result.autoBanned.available)}
                  available={result.autoBanned.available}
                >
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">Industry</p>
                        <p className="font-medium">{result.autoBanned.industry || 'N/A'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">Security Type</p>
                        <p className="font-medium">{result.autoBanned.securityType || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground mb-1">Auto-banned Status</p>
                      <p className="font-medium">
                        {result.autoBanned.autoBanned ? 'Yes - Auto-banned' : 'No - Not auto-banned'}
                      </p>
                    </div>

                    {result.autoBanned.autoBannedReason && (
                      <div className="p-4 rounded-lg bg-non-compliant/10 border border-non-compliant/30">
                        <p className="font-medium text-non-compliant">Reason:</p>
                        <p className="text-sm mt-1">{result.autoBanned.autoBannedReason}</p>
                      </div>
                    )}
                  </div>
                </MethodologyCard>
              </TabsContent>

              {/* Numeric Tab */}
              <TabsContent value="numeric" className="mt-6">
                <MethodologyCard
                  title="Numeric Methodology"
                  description="Pure financial ratio screening"
                  status={getStatusColor(null, result.numeric.status, result.numeric.available)}
                  statusLabel={getStatusLabel(null, result.numeric.status, result.numeric.available)}
                  available={result.numeric.available}
                >
                  <div className="space-y-6">
                    {/* Ratios */}
                    <div className="grid sm:grid-cols-3 gap-6">
                      <RatioDisplay
                        label="Debt Ratio"
                        value={result.numeric.debtRatio}
                        threshold={33}
                      />
                      <RatioDisplay
                        label="Cash + Investments"
                        value={result.numeric.cashInvRatio}
                        threshold={33}
                      />
                      <RatioDisplay
                        label="NPIN Ratio"
                        value={result.numeric.npinRatio}
                        threshold={5}
                      />
                    </div>

                    {/* Fail Reason */}
                    {result.numeric.failReason && (
                      <div className="p-4 rounded-lg bg-non-compliant/10 border border-non-compliant/30">
                        <p className="font-medium text-non-compliant">Fail Reason:</p>
                        <p className="text-sm mt-1">{result.numeric.failReason}</p>
                      </div>
                    )}
                  </div>
                </MethodologyCard>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
