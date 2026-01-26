import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { StatusBadge } from '@/components/StatusBadge';
import { RatioDisplay } from '@/components/RatioDisplay';
import { AppSidebar } from '@/components/AppSidebar';
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
    <Card className="min-h-[180px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-2.5 rounded-full overflow-hidden flex mb-4 bg-muted/30">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`${seg.color} transition-all`}
              style={{ width: `${(seg.value / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
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
          {/* Input Section */}
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
                    <TableRow>
                      <TableHead className="w-28">Ticker</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price ($)</TableHead>
                      <TableHead className="w-24">Value</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding, index) => (
                      <TableRow key={index}>
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
                        <TableCell className="font-medium">
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

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary Cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Portfolio Summary</h2>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-semibold text-foreground">${result.totalValue.toLocaleString()}</span>
                  </p>
                </div>
                <div className="max-w-md">
                  <SummaryCard title="Invesense Methodology" summary={result.summary.invesense} />
                </div>
              </div>

              {/* Holdings Table */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Holdings Breakdown</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ticker</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Purification</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.holdings.map((holding, index) => (
                            <TableRow
                              key={index}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedHolding(holding)}
                            >
                              <TableCell className="font-medium">{holding.ticker}</TableCell>
                              <TableCell className="text-muted-foreground">{holding.company || 'N/A'}</TableCell>
                              <TableCell className="text-right">
                                ${holding.value.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-center">
                                <StatusBadge
                                  status={getStatusColor(holding.invesense.classification, null, holding.invesense.available)}
                                  label={getStatusLabel(holding.invesense.classification, null, holding.invesense.available)}
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {holding.invesense.purificationPctRecommended !== null && holding.invesense.purificationPctRecommended !== undefined
                                  ? `${holding.invesense.purificationPctRecommended.toFixed(2)}%`
                                  : '—'}
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
                  <StatusBadge
                    status={getStatusColor(selectedHolding.invesense.classification, null, selectedHolding.invesense.available)}
                    label={getStatusLabel(selectedHolding.invesense.classification, null, selectedHolding.invesense.available)}
                  />
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
