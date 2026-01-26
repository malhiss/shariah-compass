import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

import { VerdictBadge } from '@/components/dashboard/VerdictBadge';
import { RatioDisplay } from '@/components/RatioDisplay';
import { AppSidebar } from '@/components/AppSidebar';
import { screenPortfolio, parseCSVToHoldings } from '@/lib/api';
import type { PortfolioHolding, PortfolioScreeningResponse, PortfolioHoldingResult, MethodologySummary } from '@/types/screening';
import { Upload, Plus, Trash2, Loader2, PieChart, Briefcase, ArrowRight, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PURIFICATION_COLORS = [
  'hsl(var(--warning))',
  'hsl(38, 92%, 50%)',
  'hsl(32, 95%, 44%)',
  'hsl(25, 95%, 53%)',
  'hsl(45, 93%, 47%)',
  'hsl(43, 96%, 56%)',
  'hsl(36, 100%, 50%)',
  'hsl(30, 100%, 45%)',
];

interface SegmentData {
  label: string;
  value: number;
  color: string;
  count: number;
}

function SummaryCard({ summary, holdings }: { summary: MethodologySummary; holdings: PortfolioHoldingResult[] }) {
  const total = summary.totalValue || 1;
  
  // Count holdings per segment
  const counts = {
    compliant: 0,
    withPurification: 0,
    nonCompliant: 0,
    noData: 0,
  };
  
  holdings.forEach(h => {
    if (!h.invesense.available) {
      counts.noData++;
    } else {
      const classification = (h.invesense.classification || '').toString().toLowerCase().replace(/[\s_-]/g, '');
      if (classification.includes('compliant') && !classification.includes('non') && !classification.includes('purification')) {
        counts.compliant++;
      } else if (classification.includes('purification') || classification.includes('withpurification')) {
        counts.withPurification++;
      } else if (classification.includes('non') || classification.includes('fail')) {
        counts.nonCompliant++;
      } else {
        counts.noData++;
      }
    }
  });
  
  const segments: SegmentData[] = [
    { label: 'Compliant', value: summary.compliantWeight, color: 'bg-compliant', count: counts.compliant },
    { label: 'With Purification', value: summary.compliantWithPurificationWeight, color: 'bg-warning', count: counts.withPurification },
    { label: 'Non-Compliant', value: summary.nonCompliantWeight, color: 'bg-destructive', count: counts.nonCompliant },
    { label: 'No Data', value: summary.noDataWeight, color: 'bg-muted', count: counts.noData },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Invesense Methodology</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-muted/30">
            {segments.map((seg, i) => {
              const widthPercent = (seg.value / total) * 100;
              if (widthPercent <= 0) return null;
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div
                      className={`${seg.color} transition-all cursor-pointer hover:opacity-80`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{seg.label}</p>
                    <p className="text-sm">{seg.count} {seg.count === 1 ? 'company' : 'companies'}</p>
                    <p className="text-xs text-muted-foreground">{((seg.value / total) * 100).toFixed(1)}% of portfolio</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
              <span className="text-muted-foreground text-xs">{seg.label}:</span>
              <span className="font-medium text-xs">{((seg.value / total) * 100).toFixed(1)}%</span>
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

  const handleReset = () => {
    setResult(null);
    setHoldings([{ ticker: '', quantity: 0, price: 0 }]);
  };

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
            Dividends Purification
          </h1>
          <p className="text-muted-foreground">
            Screen your portfolio for Shariah compliance and calculate purification requirements.
          </p>
        </div>

        <div className="space-y-6">
          {/* Input Section - Only show if no results */}
          {!result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Holdings</CardTitle>
                      <CardDescription>Enter holdings manually or upload CSV</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddRow}>
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
                        <TableHead className="text-foreground font-bold w-28">Ticker</TableHead>
                        <TableHead className="text-foreground font-bold">Quantity</TableHead>
                        <TableHead className="text-foreground font-bold">Price ($)</TableHead>
                        <TableHead className="text-foreground font-bold w-24">Value</TableHead>
                        <TableHead className="w-10"></TableHead>
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
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={holding.quantity || ''}
                              onChange={(e) => handleUpdateRow(index, 'quantity', e.target.value)}
                              placeholder="100"
                              min="0"
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
                            />
                          </TableCell>
                          <TableCell className="font-medium font-mono text-sm">
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

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSubmit} disabled={loading} className="btn-invesense group">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Screening...
                      </>
                    ) : (
                      <>
                        <PieChart className="w-4 h-4 mr-2" />
                        Screen Portfolio
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Portfolio Summary - Full Width */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Portfolio Summary</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">${result.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Screening
                    </Button>
                  </div>
                </div>
                
                {/* Summary Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <SummaryCard summary={result.summary.invesense} holdings={result.holdings} />
                  </div>
                  
                  {/* Total Purification Card with Pie Chart */}
                  {(() => {
                    const purificationData = result.holdings
                      .map(h => ({
                        name: h.ticker,
                        company: h.company || h.ticker,
                        value: h.value * ((h.invesense.purificationPctRecommended ?? 0) / 100),
                      }))
                      .filter(d => d.value > 0)
                      .sort((a, b) => b.value - a.value);
                    
                    const totalPurification = purificationData.reduce((sum, d) => sum + d.value, 0);
                    
                    return (
                      <Card className="bg-warning/5 border-warning/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium text-warning">Total Purification Required</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="text-3xl font-bold text-warning">
                                ${totalPurification.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {purificationData.length} of {result.holdings.length} holdings
                              </p>
                            </div>
                            {purificationData.length > 0 && (
                              <div className="w-28 h-28">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RechartsPieChart>
                                    <Pie
                                      data={purificationData}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={25}
                                      outerRadius={45}
                                      paddingAngle={2}
                                    >
                                      {purificationData.map((_, index) => (
                                        <Cell 
                                          key={`cell-${index}`} 
                                          fill={PURIFICATION_COLORS[index % PURIFICATION_COLORS.length]} 
                                        />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          const data = payload[0].payload;
                                          return (
                                            <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-md">
                                              <p className="font-medium text-sm">{data.name}</p>
                                              <p className="text-xs text-muted-foreground">{data.company}</p>
                                              <p className="text-sm font-semibold text-warning">
                                                ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {((data.value / totalPurification) * 100).toFixed(1)}% of total
                                              </p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              </div>

              {/* Holdings Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Holdings Breakdown</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {result.holdings.length} {result.holdings.length === 1 ? 'holding' : 'holdings'}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-foreground font-bold">Ticker</TableHead>
                          <TableHead className="text-foreground font-bold">Company</TableHead>
                          <TableHead className="text-right text-foreground font-bold">Quantity</TableHead>
                          <TableHead className="text-right text-foreground font-bold">Price</TableHead>
                          <TableHead className="text-right text-foreground font-bold">Value</TableHead>
                          <TableHead className="text-center text-foreground font-bold">Status</TableHead>
                          <TableHead className="text-right text-foreground font-bold">Purification %</TableHead>
                          <TableHead className="text-right text-foreground font-bold">Purification Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.holdings.map((holding, index) => {
                          const purificationPct = holding.invesense.purificationPctRecommended ?? 0;
                          const purificationAmount = holding.value * (purificationPct / 100);
                          
                          return (
                            <TableRow
                              key={index}
                              className="cursor-pointer border-border hover:bg-primary/5"
                              onClick={() => setSelectedHolding(holding)}
                            >
                              <TableCell className="font-medium text-foreground">{holding.ticker}</TableCell>
                              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                {holding.company || '—'}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {holding.quantity.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                ${holding.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-center">
                                <VerdictBadge verdict={holding.invesense.available ? holding.invesense.classification : null} />
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {holding.invesense.purificationPctRecommended !== null && holding.invesense.purificationPctRecommended !== undefined
                                  ? `${holding.invesense.purificationPctRecommended.toFixed(2)}%`
                                  : '—'}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm text-warning">
                                {purificationAmount > 0
                                  ? `$${purificationAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : '—'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Holding Detail Modal */}
      <Dialog open={!!selectedHolding} onOpenChange={() => setSelectedHolding(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedHolding && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-serif">
                  {selectedHolding.ticker} — {selectedHolding.company || 'Unknown'}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <VerdictBadge verdict={selectedHolding.invesense.available ? selectedHolding.invesense.classification : null} />
                </div>
                {selectedHolding.invesense.purificationPctRecommended !== null && selectedHolding.invesense.purificationPctRecommended !== undefined && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <p className="text-sm text-muted-foreground mb-1">Purification Rate</p>
                    <p className="text-2xl font-bold text-warning">
                      {selectedHolding.invesense.purificationPctRecommended.toFixed(2)}%
                    </p>
                  </div>
                )}
                {(selectedHolding.invesense.debtRatio !== null || selectedHolding.invesense.cashInvRatio !== null) && (
                  <div className="grid grid-cols-3 gap-4">
                    <RatioDisplay
                      label="Debt Ratio"
                      value={selectedHolding.invesense.debtRatio}
                      threshold={0.33}
                    />
                    <RatioDisplay
                      label="Cash Ratio"
                      value={selectedHolding.invesense.cashInvRatio}
                      threshold={0.33}
                    />
                    <RatioDisplay
                      label="Haram Revenue"
                      value={selectedHolding.invesense.haramRevenuePercent ? selectedHolding.invesense.haramRevenuePercent / 100 : null}
                      threshold={0.05}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppSidebar>
  );
}
