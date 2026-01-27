import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Label } from '@/components/ui/label';

import { VerdictBadge } from '@/components/dashboard/VerdictBadge';
import { RatioDisplay } from '@/components/RatioDisplay';
import { AppSidebar } from '@/components/AppSidebar';
import { screenPortfolio, parseCSVToHoldings } from '@/lib/api';
import type { PortfolioHolding, PortfolioScreeningResponse, PortfolioHoldingResult, MethodologySummary } from '@/types/screening';
import { Upload, Plus, Trash2, Loader2, PieChart, Briefcase, ArrowRight, RotateCcw, Pencil, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SortType = 'purification' | 'value';

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
        <CardTitle className="text-base font-medium">Dalil Methodology</CardTitle>
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

const PORTFOLIO_SESSION_KEY = 'portfolio_screening_result';

export default function PortfolioScreening() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([
    { ticker: '', quantity: 0, price: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioScreeningResponse | null>(() => {
    // Load from sessionStorage on mount
    try {
      const saved = sessionStorage.getItem(PORTFOLIO_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedHolding, setSelectedHolding] = useState<PortfolioHoldingResult | null>(null);
  const [sortType, setSortType] = useState<SortType>('purification');
  const [editingHolding, setEditingHolding] = useState<{ index: number; ticker: string; quantity: number; price: number } | null>(null);
  const [holdingToDelete, setHoldingToDelete] = useState<PortfolioHoldingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Persist result to sessionStorage whenever it changes
  useEffect(() => {
    if (result) {
      sessionStorage.setItem(PORTFOLIO_SESSION_KEY, JSON.stringify(result));
    } else {
      sessionStorage.removeItem(PORTFOLIO_SESSION_KEY);
    }
  }, [result]);

  const handleEditHolding = (holding: PortfolioHoldingResult, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHolding({
      index,
      ticker: holding.ticker,
      quantity: holding.quantity,
      price: holding.price,
    });
  };

  const handleSaveEdit = () => {
    if (!editingHolding || !result) return;
    
    // Update the result holdings
    const updatedHoldings = [...result.holdings];
    const holdingToUpdate = updatedHoldings.find(h => h.ticker === editingHolding.ticker);
    
    if (holdingToUpdate) {
      holdingToUpdate.quantity = editingHolding.quantity;
      holdingToUpdate.price = editingHolding.price;
      holdingToUpdate.value = editingHolding.quantity * editingHolding.price;
      
      // Recalculate totals
      const newTotalValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
      
      // Calculate new weights
      const compliantWeight = updatedHoldings.filter(h => {
        const c = (h.invesense.classification || '').toString().toLowerCase().replace(/[\s_-]/g, '');
        return c.includes('compliant') && !c.includes('non') && !c.includes('purification');
      }).reduce((sum, h) => sum + h.value, 0);
      
      const compliantWithPurificationWeight = updatedHoldings.filter(h => {
        const c = (h.invesense.classification || '').toString().toLowerCase().replace(/[\s_-]/g, '');
        return c.includes('purification') || c.includes('withpurification');
      }).reduce((sum, h) => sum + h.value, 0);
      
      const nonCompliantWeight = updatedHoldings.filter(h => {
        const c = (h.invesense.classification || '').toString().toLowerCase().replace(/[\s_-]/g, '');
        return c.includes('non') || c.includes('fail');
      }).reduce((sum, h) => sum + h.value, 0);
      
      const noDataWeight = newTotalValue - compliantWeight - compliantWithPurificationWeight - nonCompliantWeight;
      
      // Update methodology summary weights
      const updatedResult: PortfolioScreeningResponse = {
        ...result,
        holdings: updatedHoldings,
        totalValue: newTotalValue,
        summary: {
          invesense: {
            totalValue: newTotalValue,
            compliantWeight,
            compliantWithPurificationWeight,
            nonCompliantWeight,
            noDataWeight,
          },
        },
      };
      
      setResult(updatedResult);
    }
    
    setEditingHolding(null);
    toast({
      title: 'Holding Updated',
      description: `Updated ${editingHolding.ticker} quantity and price`,
  });
  };

  const handleAddRow = () => {
    setHoldings([...holdings, { ticker: '', quantity: 0, price: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (holdings.length > 1) {
      setHoldings(holdings.filter((_, i) => i !== index));
    }
  };

  const confirmDeleteHolding = () => {
    if (!holdingToDelete || !result) return;

    const updatedHoldings = result.holdings.filter(h => h.ticker !== holdingToDelete.ticker);
    
    if (updatedHoldings.length === 0) {
      setResult(null);
      setHoldingToDelete(null);
      toast({
        title: 'Portfolio Cleared',
        description: 'All holdings have been removed',
      });
      return;
    }

    // Recalculate totals
    const newTotalValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);

    // Recalculate summary weights
    let compliantValue = 0;
    let withPurificationValue = 0;
    let nonCompliantValue = 0;
    let noDataValue = 0;

    updatedHoldings.forEach(h => {
      if (!h.invesense.available) {
        noDataValue += h.value;
      } else {
        const cls = (h.invesense.classification || '').toLowerCase().replace(/[\s_-]/g, '');
        if (cls.includes('compliant') && !cls.includes('non') && !cls.includes('purification')) {
          compliantValue += h.value;
        } else if (cls.includes('purification')) {
          withPurificationValue += h.value;
        } else {
          nonCompliantValue += h.value;
        }
      }
    });

    const updatedSummary: MethodologySummary = {
      totalValue: newTotalValue,
      compliantWeight: newTotalValue > 0 ? (compliantValue / newTotalValue) * 100 : 0,
      compliantWithPurificationWeight: newTotalValue > 0 ? (withPurificationValue / newTotalValue) * 100 : 0,
      nonCompliantWeight: newTotalValue > 0 ? (nonCompliantValue / newTotalValue) * 100 : 0,
      noDataWeight: newTotalValue > 0 ? (noDataValue / newTotalValue) * 100 : 0,
    };

    setResult({
      ...result,
      holdings: updatedHoldings,
      totalValue: newTotalValue,
      summary: {
        invesense: updatedSummary,
      },
    });

    toast({
      title: 'Holding Removed',
      description: `${holdingToDelete.ticker} has been removed from the portfolio`,
    });

    setHoldingToDelete(null);
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

    // First scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' });
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Then set loading state and clear results
    setResult(null);
    setLoading(true);

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
          {/* Input Section - Only show if no results and not loading */}
          {!result && !loading && (
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
                  <Button onClick={handleSubmit} disabled={loading} className="btn-dalil group">
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

          {/* Loading State */}
          {loading && !result && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Screening Portfolio...</CardTitle>
                      <CardDescription>Analyzing your holdings for Shariah compliance</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-3 rounded-full bg-muted animate-pulse" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                      ))}
                    </div>
                    <div className="h-48 rounded-lg bg-muted animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Portfolio Summary - Full Width */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Portfolio Summary</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Portfolio Value</p>
                      <p className="text-2xl font-bold text-foreground">${result.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Screening
                    </Button>
                  </div>
                </div>
                
                {/* Summary Card - Full Width */}
                <SummaryCard summary={result.summary.invesense} holdings={result.holdings} />
              </div>

              {/* Total Purification Card - Full Width */}
              {(() => {
                const rawPurificationData = result.holdings
                  .map(h => ({
                    name: h.ticker,
                    company: h.company || h.ticker,
                    value: h.value * ((h.invesense.purificationPctRecommended ?? 0) / 100),
                  }))
                  .filter(d => d.value > 0)
                  .sort((a, b) => b.value - a.value);
                
                const totalPurification = rawPurificationData.reduce((sum, d) => sum + d.value, 0);
                
                if (rawPurificationData.length === 0) return null;
                
                // Group amounts under 1000 into "Others"
                const THRESHOLD = 2000;
                const mainItems = rawPurificationData.filter(d => d.value >= THRESHOLD);
                const smallItems = rawPurificationData.filter(d => d.value < THRESHOLD);
                const othersTotal = smallItems.reduce((sum, d) => sum + d.value, 0);
                
                const purificationData = othersTotal > 0 
                  ? [...mainItems, { name: 'Others', company: `${smallItems.length} holdings`, value: othersTotal }]
                  : mainItems;
                
                return (
                  <Card className="bg-warning/5 border-warning/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium text-warning">Total Purification Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        <div className="flex-shrink-0">
                          <p className="text-4xl font-bold text-warning">
                            ${totalPurification.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {purificationData.length} of {result.holdings.length} holdings require purification
                          </p>
                        </div>
                        
                        <div className="flex-1 flex items-center gap-6">
                          <div className="w-40 h-40 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={purificationData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={35}
                                  outerRadius={65}
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
                          
                          {/* Legend */}
                          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-2">
                            {purificationData.map((item, index) => (
                              <div key={item.name} className="flex items-center gap-2 min-w-0">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: PURIFICATION_COLORS[index % PURIFICATION_COLORS.length] }}
                                />
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.name === 'Others' ? `Others (${item.company})` : item.name}
                                </span>
                                <span className="text-xs font-medium text-warning ml-auto">
                                  ${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Holdings Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg">Holdings Breakdown</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {result.holdings.length} {result.holdings.length === 1 ? 'holding' : 'holdings'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Sort by:</span>
                      <div className="flex rounded-lg border border-border overflow-hidden">
                        <button
                          onClick={() => setSortType('purification')}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            sortType === 'purification'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          Purification
                        </button>
                        <button
                          onClick={() => setSortType('value')}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            sortType === 'value'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          Value
                        </button>
                      </div>
                    </div>
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
                          <TableHead className="text-center text-foreground font-bold w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...result.holdings]
                          .sort((a, b) => {
                            if (sortType === 'purification') {
                              const purA = a.value * ((a.invesense.purificationPctRecommended ?? 0) / 100);
                              const purB = b.value * ((b.invesense.purificationPctRecommended ?? 0) / 100);
                              return purB - purA;
                            } else {
                              return b.value - a.value;
                            }
                          })
                          .map((holding, index) => {
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
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => handleEditHolding(holding, index, e)}
                                    className="h-7 w-7"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => { e.stopPropagation(); setHoldingToDelete(holding); }}
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
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
                      threshold={33}
                    />
                    <RatioDisplay
                      label="Cash Ratio"
                      value={selectedHolding.invesense.cashInvRatio}
                      threshold={33}
                    />
                    <RatioDisplay
                      label="Haram Revenue"
                      value={selectedHolding.invesense.haramRevenuePercent}
                      threshold={5}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Holding Modal */}
      <Dialog open={!!editingHolding} onOpenChange={() => setEditingHolding(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif">
              Edit {editingHolding?.ticker}
            </DialogTitle>
          </DialogHeader>
          {editingHolding && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editingHolding.quantity}
                  onChange={(e) => setEditingHolding({
                    ...editingHolding,
                    quantity: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  step="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingHolding.price}
                  onChange={(e) => setEditingHolding({
                    ...editingHolding,
                    price: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="pt-2 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">New Value</p>
                <p className="text-lg font-mono font-semibold">
                  ${(editingHolding.quantity * editingHolding.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingHolding(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!holdingToDelete} onOpenChange={(open) => !open && setHoldingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Holding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{holdingToDelete?.ticker}</span> from your portfolio? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHolding} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppSidebar>
  );
}
