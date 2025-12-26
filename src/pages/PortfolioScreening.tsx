import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { RatioDisplay } from '@/components/RatioDisplay';
import { screenPortfolio, parseCSVToHoldings } from '@/lib/api';
import { getStatusColor, getStatusLabel } from '@/types/screening';
import type { PortfolioHolding, PortfolioScreeningResponse, PortfolioHoldingResult, MethodologySummary } from '@/types/screening';
import { Upload, Plus, Trash2, Loader2, PieChart, Briefcase, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SummaryCard({ title, summary }: { title: string; summary: MethodologySummary }) {
  const total = summary.totalValue || 1;
  const segments = [
    { label: 'Compliant', value: summary.compliantWeight, color: 'bg-compliant' },
    { label: 'With Purification', value: summary.compliantWithPurificationWeight, color: 'bg-warning' },
    { label: 'Non-Compliant', value: summary.nonCompliantWeight, color: 'bg-destructive' },
    { label: 'No Data', value: summary.noDataWeight, color: 'bg-muted' },
  ];

  return (
    <Card className="premium-card min-h-[200px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-muted/30">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`${seg.color} transition-all`}
              style={{ width: `${(seg.value / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${seg.color}`} />
              <span className="text-muted-foreground">{seg.label}:</span>
              <span className="font-medium text-foreground">{((seg.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PortfolioScreening() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([
    { ticker: '', quantity: 0, price: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioScreeningResponse | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<PortfolioHoldingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddRow = () => {
    setHoldings([...holdings, { ticker: '', quantity: 0, price: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (holdings.length > 1) {
      setHoldings(holdings.filter((_, i) => i !== index));
    }
  };

  const handleUpdateRow = (index: number, field: keyof PortfolioHolding, value: string) => {
    const updated = [...holdings];
    if (field === 'ticker') {
      updated[index][field] = value.toUpperCase();
    } else {
      updated[index][field] = parseFloat(value) || 0;
    }
    setHoldings(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseCSVToHoldings(text);
      setHoldings(parsed);
      toast({
        title: 'CSV Imported',
        description: `Imported ${parsed.length} holdings from file`,
      });
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to parse CSV',
        variant: 'destructive',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const validHoldings = holdings.filter(
      (h) => h.ticker.trim() && h.quantity > 0 && h.price > 0
    );

    if (validHoldings.length === 0) {
      toast({
        title: 'No Valid Holdings',
        description: 'Please enter at least one valid holding with ticker, quantity, and price',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await screenPortfolio(validHoldings);
      setResult(data);
    } catch (error) {
      console.error('Portfolio screening error:', error);
      toast({
        title: 'Screening Failed',
        description: error instanceof Error ? error.message : 'Failed to screen portfolio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-6">
              <Briefcase className="w-4 h-4" />
              <span>Portfolio Analysis</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Portfolio Screening
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Screen your entire portfolio for Shariah compliance across multiple methodologies.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Input Section */}
            <Card className="premium-card">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-serif">Holdings</CardTitle>
                      <CardDescription>Enter your portfolio holdings manually or upload a CSV</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-border hover:border-primary hover:bg-primary/5">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                    <Button variant="outline" onClick={handleAddRow} className="border-border hover:border-primary hover:bg-primary/5">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Row
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-32 text-muted-foreground">Ticker</TableHead>
                        <TableHead className="text-muted-foreground">Quantity</TableHead>
                        <TableHead className="text-muted-foreground">Price ($)</TableHead>
                        <TableHead className="w-28 text-muted-foreground">Value</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdings.map((holding, index) => (
                        <TableRow key={index} className="border-border">
                          <TableCell>
                            <Input
                              value={holding.ticker}
                              onChange={(e) => handleUpdateRow(index, 'ticker', e.target.value)}
                              placeholder="NVDA"
                              className="w-24 bg-background border-border focus:border-primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={holding.quantity || ''}
                              onChange={(e) => handleUpdateRow(index, 'quantity', e.target.value)}
                              placeholder="100"
                              min="0"
                              className="bg-background border-border focus:border-primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={holding.price || ''}
                              onChange={(e) => handleUpdateRow(index, 'price', e.target.value)}
                              placeholder="125.00"
                              min="0"
                              step="0.01"
                              className="bg-background border-border focus:border-primary"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            ${(holding.quantity * holding.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveRow(index)}
                              disabled={holdings.length === 1}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button onClick={handleSubmit} disabled={loading} size="lg" className="btn-invesense group">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Screening Portfolio...
                      </>
                    ) : (
                      <>
                        <PieChart className="w-5 h-5 mr-2" />
                        Screen Portfolio
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <div className="space-y-8 animate-fade-in">
                {/* Summary Cards */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold">Portfolio Summary</h2>
                    <p className="text-muted-foreground">
                      Total Value: <span className="text-foreground font-semibold">${result.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <SummaryCard title="Invesense Methodology" summary={result.summary.invesense} />
                    <SummaryCard title="Auto-banned Methodology" summary={result.summary.autoBanned} />
                    <SummaryCard title="Numeric Methodology" summary={result.summary.numeric} />
                  </div>
                </div>

                {/* Holdings Table */}
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-6">Holdings Breakdown</h2>
                  <Card className="premium-card">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                              <TableHead className="text-muted-foreground">Ticker</TableHead>
                              <TableHead className="text-muted-foreground">Company</TableHead>
                              <TableHead className="text-right text-muted-foreground">Value</TableHead>
                              <TableHead className="text-center text-muted-foreground">Invesense</TableHead>
                              <TableHead className="text-center text-muted-foreground">Auto-banned</TableHead>
                              <TableHead className="text-center text-muted-foreground">Numeric</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.holdings.map((holding, index) => (
                              <TableRow
                                key={index}
                                className="cursor-pointer border-border hover:bg-primary/5"
                                onClick={() => setSelectedHolding(holding)}
                              >
                                <TableCell className="font-medium text-foreground">{holding.ticker}</TableCell>
                                <TableCell className="text-muted-foreground">{holding.company || 'N/A'}</TableCell>
                                <TableCell className="text-right text-foreground">
                                  ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-center">
                                  <StatusBadge
                                    status={getStatusColor(holding.invesense.classification, null, holding.invesense.available)}
                                    label={getStatusLabel(holding.invesense.classification, null, holding.invesense.available)}
                                    size="sm"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <StatusBadge
                                    status={getStatusColor(null, holding.autoBanned.status, holding.autoBanned.available)}
                                    label={getStatusLabel(null, holding.autoBanned.status, holding.autoBanned.available)}
                                    size="sm"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <StatusBadge
                                    status={getStatusColor(null, holding.numeric.status, holding.numeric.available)}
                                    label={getStatusLabel(null, holding.numeric.status, holding.numeric.available)}
                                    size="sm"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Holding Detail Modal */}
      <Dialog open={!!selectedHolding} onOpenChange={() => setSelectedHolding(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          {selectedHolding && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">
                  {selectedHolding.ticker} — {selectedHolding.company || 'Unknown'}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="invesense" className="mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="invesense">Invesense</TabsTrigger>
                  <TabsTrigger value="autobanned">Auto-banned</TabsTrigger>
                  <TabsTrigger value="numeric">Numeric</TabsTrigger>
                </TabsList>

                <TabsContent value="invesense" className="mt-4 space-y-4">
                  <StatusBadge
                    status={getStatusColor(selectedHolding.invesense.classification, null, selectedHolding.invesense.available)}
                    label={getStatusLabel(selectedHolding.invesense.classification, null, selectedHolding.invesense.available)}
                  />
                  {selectedHolding.invesense.available && (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <RatioDisplay label="Debt" value={selectedHolding.invesense.debtRatio} threshold={33} />
                      <RatioDisplay label="Cash+Inv" value={selectedHolding.invesense.cashInvRatio} threshold={33} />
                      <RatioDisplay label="NPIN" value={selectedHolding.invesense.npinRatio} threshold={5} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="autobanned" className="mt-4 space-y-4">
                  <StatusBadge
                    status={getStatusColor(null, selectedHolding.autoBanned.status, selectedHolding.autoBanned.available)}
                    label={getStatusLabel(null, selectedHolding.autoBanned.status, selectedHolding.autoBanned.available)}
                  />
                  {selectedHolding.autoBanned.autoBannedReason && (
                    <p className="text-sm text-muted-foreground">
                      {selectedHolding.autoBanned.autoBannedReason}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="numeric" className="mt-4 space-y-4">
                  <StatusBadge
                    status={getStatusColor(null, selectedHolding.numeric.status, selectedHolding.numeric.available)}
                    label={getStatusLabel(null, selectedHolding.numeric.status, selectedHolding.numeric.available)}
                  />
                  {selectedHolding.numeric.available && (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <RatioDisplay label="Debt" value={selectedHolding.numeric.debtRatio} threshold={33} />
                      <RatioDisplay label="Cash+Inv" value={selectedHolding.numeric.cashInvRatio} threshold={33} />
                      <RatioDisplay label="NPIN" value={selectedHolding.numeric.npinRatio} threshold={5} />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
