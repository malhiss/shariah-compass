import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, Briefcase, FileQuestion, MessageSquare, Scale, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Screen a Ticker',
    description: 'Check if a stock is Shariah-compliant using three independent methodologies.',
    path: '/screen',
    color: 'text-primary',
  },
  {
    icon: Briefcase,
    title: 'Screen a Portfolio',
    description: 'Upload your portfolio or enter holdings to screen all positions at once.',
    path: '/portfolio',
    color: 'text-accent',
  },
  {
    icon: FileQuestion,
    title: 'Request a Screening',
    description: 'Submit a ticker that hasn\'t been screened yet for analysis.',
    path: '/request',
    color: 'text-compliant',
  },
  {
    icon: MessageSquare,
    title: 'Ask the AI',
    description: 'Get AI-powered explanations for any screening result.',
    path: '/chat',
    color: 'text-compliant-purification',
  },
];

const methodologies = [
  {
    name: 'Invesense Methodology',
    description: 'Comprehensive Shariah screening using financial ratios, qualitative analysis, and LLM-powered haram sector estimation. Classifications include Compliant, Compliant with Purification, Non-Compliant, and Doubtful.',
    icon: Scale,
  },
  {
    name: 'Auto-banned Methodology',
    description: 'Automatic screening based on security type and industry classification. Preferred stocks, trust shares, and companies in forbidden industries (alcohol, gambling, conventional finance) are flagged.',
    icon: AlertTriangle,
  },
  {
    name: 'Numeric Methodology',
    description: 'Pure financial ratio screening: Debt ≤33%, Cash+Investments ≤33%, and NPIN (Non-Permissible Income) ≤5% of total revenue.',
    icon: CheckCircle,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gold-accent mx-auto mb-8 flex items-center justify-center shadow-lg">
              <Scale className="w-10 h-10 text-accent-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-balance">
              Shariah Screening Made Simple
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
              Screen stocks against multiple Shariah compliance methodologies. 
              Get detailed analysis with clear classifications and purification requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg">
                <Link to="/screen">
                  <Search className="w-5 h-5 mr-2" />
                  Screen a Ticker
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground">
                <Link to="/portfolio">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Screen Portfolio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Shariah Screening */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              What is Shariah Screening?
            </h2>
            <p className="text-lg text-muted-foreground">
              Shariah screening evaluates whether an investment complies with Islamic principles. 
              It examines a company's business activities and financial ratios to determine permissibility.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-compliant/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-compliant" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Fully permissible for Islamic investment with no purification required.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-compliant-purification/10 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-compliant-purification" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Purification Required</h3>
              <p className="text-sm text-muted-foreground">
                Permissible but requires donation of impure income portion as purification.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-non-compliant/10 mx-auto mb-4 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-non-compliant" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Non-Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Not permissible due to core business or excessive impure income.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodologies */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Three Independent Methodologies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each ticker is screened against three methodologies, giving you a comprehensive view of compliance status.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {methodologies.map((method) => {
              const Icon = method.icon;
              return (
                <Card key={method.name} className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 mb-4 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-serif">{method.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Get Started
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.path} to={feature.path}>
                  <Card className="hover:shadow-lg transition-all group cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-lg font-serif">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
