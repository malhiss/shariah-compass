import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { submitScreeningRequest } from '@/lib/api';
import type { ScreeningRequestInput, ScreeningRequestResponse } from '@/types/screening';
import { FileQuestion, Loader2, CheckCircle, ArrowRight, Send } from 'lucide-react';
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
      <div className="min-h-screen">
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="max-w-lg mx-auto text-center animate-fade-in">
              <div className="w-24 h-24 rounded-2xl bg-compliant/10 mx-auto mb-8 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-compliant" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Request Submitted!</h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Your screening request for <strong className="text-foreground">{form.ticker}</strong> has been submitted successfully.
              </p>
              
              <Card className="text-left mb-8 border-border bg-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Request ID</span>
                    <span className="font-mono font-medium text-foreground">{result.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-primary">{result.status}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Methodology</span>
                    <span className="font-medium text-foreground capitalize">{form.methodology.replace('_', '-')}</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setResult(null)} className="border-border hover:border-primary hover:bg-primary/5">
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
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-6">
              <FileQuestion className="w-4 h-4" />
              <span>Request Analysis</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Request a Screening
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Submit a ticker that hasn't been screened yet for comprehensive analysis.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileQuestion className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-xl">Screening Request Form</CardTitle>
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
                    <Label htmlFor="ticker" className="text-foreground">Ticker Symbol *</Label>
                    <Input
                      id="ticker"
                      value={form.ticker}
                      onChange={(e) => handleChange('ticker', e.target.value)}
                      placeholder="e.g., NVDA"
                      required
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>

                  {/* Exchange & ISIN */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exchange" className="text-foreground">Exchange (optional)</Label>
                      <Input
                        id="exchange"
                        value={form.exchange}
                        onChange={(e) => handleChange('exchange', e.target.value)}
                        placeholder="e.g., NASDAQ"
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isin" className="text-foreground">ISIN (optional)</Label>
                      <Input
                        id="isin"
                        value={form.isin}
                        onChange={(e) => handleChange('isin', e.target.value)}
                        placeholder="e.g., US0378331005"
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className="bg-background border-border focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll notify you when the screening is complete
                    </p>
                  </div>

                  {/* Methodology */}
                  <div className="space-y-2">
                    <Label htmlFor="methodology" className="text-foreground">Preferred Methodology</Label>
                    <Select
                      value={form.methodology}
                      onValueChange={(value) => handleChange('methodology', value)}
                    >
                      <SelectTrigger className="bg-background border-border focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="invesense">Invesense Methodology</SelectItem>
                        <SelectItem value="numeric">Numeric Methodology</SelectItem>
                        <SelectItem value="auto_banned">Auto-banned Methodology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Use Case */}
                  <div className="space-y-2">
                    <Label htmlFor="useCase" className="text-foreground">Use Case (optional)</Label>
                    <Textarea
                      id="useCase"
                      value={form.useCase}
                      onChange={(e) => handleChange('useCase', e.target.value)}
                      placeholder="e.g., Personal portfolio, Institutional investment, Research..."
                      rows={3}
                      className="bg-background border-border focus:border-primary resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full btn-invesense group" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
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
      </section>
    </div>
  );
}
