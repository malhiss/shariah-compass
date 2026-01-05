import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AppSidebar } from '@/components/AppSidebar';
import { submitScreeningRequest } from '@/lib/api';
import type { ScreeningRequestInput, ScreeningRequestResponse } from '@/types/screening';
import { FileText, Loader2, CheckCircle, ArrowRight, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function ScreeningRequest() {
  const [form, setForm] = useState<ScreeningRequestInput>({
    ticker: '',
    exchange: '',
    isin: '',
    email: '',
    methodology: 'invesense',
    useCase: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreeningRequestResponse | null>(null);
  const { toast } = useToast();

  const handleChange = (field: keyof ScreeningRequestInput, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'ticker' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ticker.trim()) {
      toast({
        title: 'Ticker Required',
        description: 'Please enter a ticker symbol',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await submitScreeningRequest(form);
      setResult(response);
      toast({
        title: 'Request Submitted',
        description: 'Your screening request has been submitted successfully',
      });
    } catch (error) {
      console.error('Request submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (result?.success) {
    return (
      <AppSidebar>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-compliant/10 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-compliant" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-3">Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Your screening request for <strong className="text-foreground">{form.ticker}</strong> has been submitted.
            </p>
            
            <Card className="text-left mb-6">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Request ID</span>
                  <span className="font-mono text-sm">{result.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm text-primary font-medium">{result.status}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Methodology</span>
                  <span className="text-sm capitalize">{form.methodology.replace('_', '-')}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setResult(null)}>
                Submit Another
              </Button>
              <Button asChild className="btn-invesense group">
                <Link to="/screen">
                  Screen a Ticker
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AppSidebar>
    );
  }

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
            Request Screening
          </h1>
          <p className="text-muted-foreground">
            Submit a ticker that hasn't been screened yet for comprehensive analysis.
          </p>
        </div>

        <div className="max-w-xl mx-auto lg:mx-0">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Screening Request</CardTitle>
                  <CardDescription>Fill in details for the security you want screened</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Ticker */}
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker Symbol *</Label>
                  <Input
                    id="ticker"
                    value={form.ticker}
                    onChange={(e) => handleChange('ticker', e.target.value)}
                    placeholder="e.g., NVDA"
                    required
                  />
                </div>

                {/* Exchange & ISIN */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exchange">Exchange</Label>
                    <Input
                      id="exchange"
                      value={form.exchange}
                      onChange={(e) => handleChange('exchange', e.target.value)}
                      placeholder="e.g., NASDAQ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isin">ISIN</Label>
                    <Input
                      id="isin"
                      value={form.isin}
                      onChange={(e) => handleChange('isin', e.target.value)}
                      placeholder="e.g., US0378331005"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll notify you when the screening is complete
                  </p>
                </div>

                {/* Methodology */}
                <div className="space-y-2">
                  <Label htmlFor="methodology">Preferred Methodology</Label>
                  <Select
                    value={form.methodology}
                    onValueChange={(value) => handleChange('methodology', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invesense">Invesense Methodology</SelectItem>
                      <SelectItem value="numeric">Numeric Methodology</SelectItem>
                      <SelectItem value="auto_banned">Auto-banned Methodology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Use Case */}
                <div className="space-y-2">
                  <Label htmlFor="useCase">Use Case</Label>
                  <Textarea
                    id="useCase"
                    value={form.useCase}
                    onChange={(e) => handleChange('useCase', e.target.value)}
                    placeholder="e.g., Personal portfolio, Institutional investment..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="w-full btn-invesense group" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebar>
  );
}
