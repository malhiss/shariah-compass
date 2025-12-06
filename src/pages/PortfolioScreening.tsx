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
import { Upload, Plus, Trash2, Loader2, PieChart, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SummaryCard({ title, summary }: { title: string; summary: MethodologySummary }) {
  const total = summary.totalValue || 1;
  const segments = [
    { label: 'Compliant', value: summary.compliantWeight, color: 'bg-compliant' },
    { label: 'With Purification', value: summary.compliantWithPurificationWeight, color: 'bg-compliant-purification' },
    { label: 'Non-Compliant', value: summary.nonCompliantWeight, color: 'bg-non-compliant' },
    { label: 'No Data', value: summary.noDataWeight, color: 'bg-no-data' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-4 rounded-full overflow-hidden flex mb-4">
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
              <div className={`w-3 h-3 rounded-full ${seg.color}`} />
              <span className="text-muted-foreground">{seg.label}:</span>
              <span className="font-medium">{((seg.value / total) * 100).toFixed(1)}%</span>
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
    <div className="container py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            Portfolio Screening
          </h1>
          <p className="text-muted-foreground text-lg">
            Screen your entire portfolio for Shariah compliance
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Holdings
                </CardTitle>
                <CardDescription>Enter your portfolio holdings manually or upload a CSV</CardDescription>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </Button>
                <Button variant="outline" onClick={handleAddRow}>
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
                    <TableHead className="w-32">Ticker</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price ($)</TableHead>
                    <TableHead className="w-20">Value</TableHead>
                    <TableHead className="w-12"></TableHead>
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
                          className="w-24"
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
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Screening Portfolio...
                  </>
                ) : (
                  <>
                    <PieChart className="w-5 h-5 mr-2" />
                    Screen Portfolio
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
              <h2 className="text-2xl font-serif font-bold mb-4">Portfolio Summary</h2>
              <p className="text-muted-foreground mb-6">
                Total Portfolio Value: ${result.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <SummaryCard title="Invesense Methodology" summary={result.summary.invesense} />
                <SummaryCard title="Auto-banned Methodology" summary={result.summary.autoBanned} />
                <SummaryCard title="Numeric Methodology" summary={result.summary.numeric} />
              </div>
            </div>

            {/* Holdings Table */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">Holdings Breakdown</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticker</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-center">Invesense</TableHead>
                          <TableHead className="text-center">Auto-banned</TableHead>
                          <TableHead className="text-center">Numeric</TableHead>
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
                            <TableCell>{holding.company || 'N/A'}</TableCell>
                            <TableCell className="text-right">
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

        {/* Holding Detail Modal */}
        <Dialog open={!!selectedHolding} onOpenChange={() => setSelectedHolding(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedHolding && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif">
                    {selectedHolding.ticker} — {selectedHolding.company || 'Unknown'}
                  </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="invesense" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
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
    </div>
  );
}
