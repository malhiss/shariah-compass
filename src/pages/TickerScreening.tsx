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
import { Search, Loader2, Scale, AlertTriangle, Calculator, Building2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-6">
                <Search className="w-4 h-4" />
                <span>Ticker Analysis</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Screen a Ticker
              </h1>
              <p className="text-lg text-muted-foreground">
                Enter a stock symbol to check its Shariah compliance status
              </p>
            </motion.div>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter ticker symbol (e.g., NVDA, AAPL)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        className="pl-12 h-14 text-lg bg-background border-border focus:border-primary"
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" size="lg" disabled={loading || !ticker.trim()} className="btn-invesense h-14 px-8 group">
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
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Results */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {result && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Security Info */}
                <Card className="border-2 border-primary/20 bg-card">
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

                {/* Methodology Tabs */}
                <Tabs defaultValue="invesense" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto bg-muted/50">
                    <TabsTrigger value="invesense" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Scale className="w-4 h-4" />
                      <span className="hidden sm:inline">Invesense</span>
                    </TabsTrigger>
                    <TabsTrigger value="autobanned" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="hidden sm:inline">Auto-banned</span>
                    </TabsTrigger>
                    <TabsTrigger value="numeric" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Calculator className="w-4 h-4" />
                      <span className="hidden sm:inline">Numeric</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Invesense Tab */}
                  <TabsContent value="invesense" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
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
                  </TabsContent>

                  {/* Auto-banned Tab */}
                  <TabsContent value="autobanned" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
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
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                              <p className="font-medium text-destructive">Reason:</p>
                              <p className="text-sm mt-1">{result.autoBanned.autoBannedReason}</p>
                            </div>
                          )}
                        </div>
                      </MethodologyCard>
                    </motion.div>
                  </TabsContent>

                  {/* Numeric Tab */}
                  <TabsContent value="numeric" className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
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
                            <RatioDisplay label="Debt Ratio" value={result.numeric.debtRatio} threshold={33} />
                            <RatioDisplay label="Cash + Investments" value={result.numeric.cashInvRatio} threshold={33} />
                            <RatioDisplay label="NPIN Ratio" value={result.numeric.npinRatio} threshold={5} />
                          </div>

                          {/* Fail Reason */}
                          {result.numeric.failReason && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                              <p className="font-medium text-destructive">Fail Reason:</p>
                              <p className="text-sm mt-1">{result.numeric.failReason}</p>
                            </div>
                          )}
                        </div>
                      </MethodologyCard>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
