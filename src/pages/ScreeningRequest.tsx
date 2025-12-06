import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { submitScreeningRequest } from '@/lib/api';
import type { ScreeningRequestInput, ScreeningRequestResponse } from '@/types/screening';
import { FileQuestion, Loader2, CheckCircle } from 'lucide-react';
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
      <div className="container py-8 md:py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-compliant/10 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-compliant" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-4">Request Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Your screening request for <strong>{form.ticker}</strong> has been submitted successfully.
          </p>
          <Card className="text-left mb-6">
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request ID:</span>
                <span className="font-mono font-medium">{result.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-compliant-purification">{result.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Methodology:</span>
                <span className="font-medium capitalize">{form.methodology.replace('_', '-')}</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setResult(null)}>
              Submit Another
            </Button>
            <Button asChild>
              <Link to="/screen">Screen a Ticker</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            Request a Screening
          </h1>
          <p className="text-muted-foreground text-lg">
            Submit a ticker that hasn't been screened yet
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Screening Request Form</CardTitle>
                <CardDescription>
                  Fill in the details for the security you want screened
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Label htmlFor="exchange">Exchange (optional)</Label>
                  <Input
                    id="exchange"
                    value={form.exchange}
                    onChange={(e) => handleChange('exchange', e.target.value)}
                    placeholder="e.g., NASDAQ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isin">ISIN (optional)</Label>
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
                <Label htmlFor="email">Email (optional)</Label>
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
                <Label htmlFor="useCase">Use Case (optional)</Label>
                <Textarea
                  id="useCase"
                  value={form.useCase}
                  onChange={(e) => handleChange('useCase', e.target.value)}
                  placeholder="e.g., Personal portfolio, Institutional investment, Research..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileQuestion className="w-5 h-5 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
