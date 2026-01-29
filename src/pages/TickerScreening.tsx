import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { MethodologyCard } from '@/components/MethodologyCard';
import { RatioDisplay } from '@/components/RatioDisplay';
import { AppSidebar } from '@/components/AppSidebar';
import { screenTicker } from '@/lib/api';
import { getStatusColor, getStatusLabel } from '@/types/screening';
import type { TickerScreeningResponse } from '@/types/screening';
import { Search, Loader2, Building2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatedSection } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';

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
    } catch {
      toast({
        title: 'Screening Failed',
        description: 'Failed to screen ticker. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-4">
            <Search className="w-4 h-4" />
            <span>Ticker Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
            Screen a Ticker
          </h1>
          <p className="text-muted-foreground">
            Enter a stock symbol to check its Shariah compliance status
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6 lg:mb-8">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter ticker symbol (e.g., NVDA, AAPL)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="pl-12 h-12 sm:h-14 text-base sm:text-lg bg-background border-border focus:border-primary"
                  disabled={loading}
                />
              </div>
              <Button type="submit" size="lg" disabled={loading || !ticker.trim()} className="btn-dalil h-12 sm:h-14 px-6 sm:px-8 group">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Screening...
                  </>
                ) : (
                  <>
                    Screen
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
            {result && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Security Info */}
                <Card className="premium-card border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                      >
                        <Building2 className="w-7 h-7 text-primary" />
                      </motion.div>
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

                {/* Dalil Methodology */}
                <MethodologyCard
                  title="Dalil Methodology"
                  description="Comprehensive Shariah screening with qualitative and quantitative analysis"
                  status={getStatusColor(result.invesense.classification, null, result.invesense.available)}
                  statusLabel={getStatusLabel(result.invesense.classification, null, result.invesense.available)}
                  available={result.invesense.available}
                >
                  <div className="space-y-6">
                    {/* Ratios */}
                    <div className="grid sm:grid-cols-3 gap-6">
                      <RatioDisplay label="Debt Ratio" value={result.invesense.debtRatio} threshold={33} />
                      <RatioDisplay label="Cash + Investments" value={result.invesense.cashInvRatio} threshold={33} />
                      <RatioDisplay label="NPIN Ratio" value={result.invesense.npinRatio} threshold={5} />
                    </div>

                    {/* Purification */}
                    {result.invesense.purificationRequired && (
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                        <p className="font-medium text-warning">
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
                        <p className="text-sm text-muted-foreground">{result.invesense.shariahSummary}</p>
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
              </motion.div>
            )}
        </div>
      </div>
    </AppSidebar>
  );
}
