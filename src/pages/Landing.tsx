import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, Briefcase, FileQuestion, MessageSquare, Scale, CheckCircle, AlertTriangle, XCircle, ArrowRight, ChevronRight } from 'lucide-react';
import invesenseLogo from '@/assets/invesense-logo.png';

const features = [
  {
    icon: Search,
    title: 'Screen a Ticker',
    description: 'Check if a stock is Shariah-compliant using three independent methodologies.',
    path: '/screen',
  },
  {
    icon: Briefcase,
    title: 'Screen a Portfolio',
    description: 'Upload your portfolio or enter holdings to screen all positions at once.',
    path: '/portfolio',
  },
  {
    icon: FileQuestion,
    title: 'Request a Screening',
    description: "Submit a ticker that hasn't been screened yet for analysis.",
    path: '/request',
  },
  {
    icon: MessageSquare,
    title: 'Ask the AI',
    description: 'Get AI-powered explanations for any screening result.',
    path: '/chat',
  },
];

const methodologies = [
  {
    name: 'Invesense Methodology',
    description: 'Comprehensive Shariah screening using financial ratios, qualitative analysis, and LLM-powered haram sector estimation.',
    icon: Scale,
  },
  {
    name: 'Auto-banned Methodology',
    description: 'Automatic screening based on security type and industry classification for forbidden sectors.',
    icon: AlertTriangle,
  },
  {
    name: 'Numeric Methodology',
    description: 'Pure financial ratio screening: Debt ≤33%, Cash+Investments ≤33%, and NPIN ≤5%.',
    icon: CheckCircle,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-8">
              <Scale className="w-4 h-4" />
              <span>Shariah-Compliant Investment Screening</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              <span className="text-foreground">Invest with </span>
              <span className="text-primary">Confidence</span>
              <br />
              <span className="text-foreground">and Faith</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Screen stocks against multiple Shariah compliance methodologies. 
              Get detailed analysis with clear classifications and purification requirements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-invesense text-lg group" asChild>
                <Link to="/screen">
                  <Search className="w-5 h-5 mr-2" />
                  Screen a Ticker
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg border-border hover:bg-primary/5 hover:border-primary">
                <Link to="/portfolio">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Screen Portfolio
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* What is Shariah Screening */}
      <section className="py-20 md:py-28 bg-card/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Understanding Compliance</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              What is Shariah Screening?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Shariah screening evaluates whether an investment complies with Islamic principles. 
              It examines a company's business activities and financial ratios to determine permissibility.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-background border border-border hover:border-compliant/50 transition-colors group">
              <div className="w-20 h-20 rounded-2xl bg-compliant/10 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-10 h-10 text-compliant" />
              </div>
              <h3 className="font-serif font-semibold text-xl mb-3">Compliant</h3>
              <p className="text-muted-foreground">
                Fully permissible for Islamic investment with no purification required.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-background border border-border hover:border-warning/50 transition-colors group">
              <div className="w-20 h-20 rounded-2xl bg-warning/10 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-10 h-10 text-warning" />
              </div>
              <h3 className="font-serif font-semibold text-xl mb-3">Purification Required</h3>
              <p className="text-muted-foreground">
                Permissible but requires donation of impure income portion as purification.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-background border border-border hover:border-destructive/50 transition-colors group">
              <div className="w-20 h-20 rounded-2xl bg-destructive/10 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="font-serif font-semibold text-xl mb-3">Non-Compliant</h3>
              <p className="text-muted-foreground">
                Not permissible due to core business or excessive impure income.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodologies */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Our Approach</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Three Independent Methodologies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each ticker is screened against three methodologies, giving you a comprehensive view of compliance status.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {methodologies.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card 
                  key={method.name} 
                  className="group relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 mb-6 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-xl">{method.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{method.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Platform Features</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Get Started
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our suite of tools designed for Shariah-compliant investing.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.path} to={feature.path} className="group">
                  <Card className="h-full border-border bg-background hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <CardTitle className="text-lg font-serif group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Ready to Screen Your Investments?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Start screening your portfolio for Shariah compliance today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-invesense text-lg group" asChild>
                <Link to="/screen">
                  Get Started
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg border-border hover:bg-primary/5 hover:border-primary">
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
