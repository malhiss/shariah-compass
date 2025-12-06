import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, Users, BookOpen, BarChart3, Database, Brain, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Regulated by the DFSA',
    description: 'Invesense Asset Management Limited is a DIFC registered Company and an Authorized Firm regulated by the Dubai Financial Services Authority (DFSA) under a Category 3C license, with reference number F002331.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Invesense is fully committed to transparency in all aspects of our operations. Our operations are governed by global corporate governance policies.',
  },
  {
    icon: Users,
    title: 'Institutionally Experienced Team',
    description: 'The founders have 40 years of experience in institutional asset management regionally and globally.',
  },
  {
    icon: BookOpen,
    title: 'Shariah Compliant',
    description: 'Invesense strategies have their own Shariah Advisory and Supervisory Board. In addition to industry screens, Invesense conducts qualitative screens to ensure that our business activities are Shariah compliant.',
  },
];

const approach = [
  {
    icon: Database,
    title: 'Data-Oriented',
    description: 'Our screening process relies on comprehensive financial data from authoritative sources to ensure accurate compliance assessments.',
  },
  {
    icon: Brain,
    title: 'AI-Enhanced',
    description: 'We leverage advanced AI models to analyze company activities and estimate haram revenue exposure with greater precision.',
  },
  {
    icon: BarChart3,
    title: 'Multi-Methodology',
    description: 'Three independent screening methodologies provide a comprehensive view of Shariah compliance status for every security.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 md:py-28 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 animate-slide-in-left">
              About <span className="text-primary">Invesense</span>
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in">
              Invesense is a global investment solution provider that aims to achieve higher returns 
              and maintain a long-term disciplined approach to Shariah-compliant investing.
            </p>
          </div>
        </div>
      </section>

      {/* Firm Overview */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Firm Overview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on decades of institutional experience and a commitment to Islamic finance principles.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={value.title} 
                  className="border border-border/50 hover:border-primary/30 transition-all bg-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 mb-6 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investing Approach */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Screening Approach</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our systematic approach combines traditional Islamic finance principles with modern technology.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {approach.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title} 
                  className="text-center p-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shariah Screening Platform */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Shariah Screening Platform</h2>
              <p className="text-muted-foreground">
                Our platform provides comprehensive Shariah compliance screening for equities worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border border-compliant/30 bg-compliant/5">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-compliant mb-2">3</div>
                  <p className="text-sm text-muted-foreground">Independent Methodologies</p>
                </CardContent>
              </Card>
              <Card className="border border-primary/30 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">AI</div>
                  <p className="text-sm text-muted-foreground">Powered Explanations</p>
                </CardContent>
              </Card>
              <Card className="border border-compliant-purification/30 bg-compliant-purification/5">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-compliant-purification mb-2">%</div>
                  <p className="text-sm text-muted-foreground">Purification Calculations</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                className="btn-invesense text-primary-foreground"
                asChild
              >
                <Link to="/screen">
                  Start Screening
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
