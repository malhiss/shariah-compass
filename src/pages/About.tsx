import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, Eye, Users, BookOpen, BarChart3, Database, Brain, 
  Globe, Target, DollarSign, Droplets, CheckCircle, 
  AlertTriangle, XCircle
} from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import { GradientText } from '@/components/landing/GradientText';

const firmValues = [
  {
    icon: Shield,
    title: 'DFSA Regulated',
    description: 'Authorized Firm regulated by the Dubai Financial Services Authority under Category 3C license (F002331).',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Fully committed to transparency in all operations, governed by global corporate governance policies.',
  },
  {
    icon: Users,
    title: 'Institutional Experience',
    description: '40+ years of combined experience in institutional asset management regionally and globally.',
  },
  {
    icon: BookOpen,
    title: 'Shariah Compliant',
    description: 'Own Shariah Advisory and Supervisory Board with industry and qualitative screens for compliance.',
  },
];

const investingApproach = [
  { icon: Database, title: 'Data-Oriented', description: 'Models built from academic research and industry experience.' },
  { icon: BarChart3, title: 'Long-Term Driven', description: 'Strategies designed to leverage compounding for cumulative gains.' },
  { icon: Droplets, title: 'Liquid', description: 'Portfolio liquidity is a core principle.' },
  { icon: Globe, title: 'Global', description: 'All strategies are globally oriented.' },
  { icon: Target, title: 'Portfolio Design', description: 'Systematic, diversified approach for consistent returns.' },
  { icon: DollarSign, title: 'Cost Conscious', description: 'Cost-conscious fees for higher net returns.' },
];

const screeningApproach = [
  { icon: Database, title: 'Data-Oriented', description: 'Comprehensive financial data from authoritative sources for accurate compliance assessments.' },
  { icon: Brain, title: 'AI-Enhanced', description: 'Advanced AI models to analyze company activities and estimate haram revenue exposure.' },
  { icon: BarChart3, title: 'Multi-Methodology', description: 'Three independent screening methodologies for comprehensive compliance status.' },
];

export default function About() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="container relative z-10 px-4 sm:px-6">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <p className="section-label">About Us</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              About <GradientText>Dalil</GradientText>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Dalil is a global investment solution provider that achieves higher returns through a long-term, disciplined approach to Shariah-compliant investing.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Firm Values */}
      <section className="py-16 lg:py-24 bg-card/50">
        <div className="container px-4 sm:px-6">
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {firmValues.map((value) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={value.title} className="h-full">
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="h-full group hover:border-primary/40">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Firm Overview */}
      <section id="firm-overview" className="py-20 lg:py-28">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">Our Foundation</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">Firm Overview</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on decades of institutional experience and commitment to Islamic finance principles.
            </p>
          </AnimatedSection>
          
          <div className="max-w-4xl mx-auto">
            <AnimatedSection delay={0.1}>
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-8 lg:p-10 relative">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold mb-3">DFSA Regulated</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        Dalil Asset Management Limited is a DIFC registered Company and an Authorized Firm regulated by the Dubai Financial Services Authority (DFSA) under a Category 3C license, with reference number F002331.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-2 rounded-full bg-background/50 border border-border text-sm font-medium">DIFC Registered</span>
                        <span className="px-4 py-2 rounded-full bg-background/50 border border-border text-sm font-medium">Category 3C License</span>
                        <span className="px-4 py-2 rounded-full bg-background/50 border border-border text-sm font-medium">Ref: F002331</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Investing Approach */}
      <section id="investing-approach" className="py-20 lg:py-28 bg-card/50">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">How We Invest</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">Investing Approach</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our investment philosophy is built on proven principles and disciplined execution.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {investingApproach.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title} className="h-full">
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="h-full group hover:border-primary/40">
                      <CardContent className="p-6 text-center flex flex-col h-full">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Screening Approach */}
      <section id="screening-approach" className="py-20 lg:py-28">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">How We Screen</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">Screening Approach</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining traditional Islamic finance principles with modern technology for accurate compliance assessment.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {screeningApproach.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <motion.div className="text-center p-8" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Compliance Status Cards */}
      <section id="methodology" className="py-20 lg:py-28 bg-card/50">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">Compliance Status</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">
              Understanding <GradientText>Screening Results</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each ticker receives a clear classification based on comprehensive analysis.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <StaggerItem className="h-full">
              <motion.div 
                className="h-full flex flex-col text-center p-8 rounded-2xl bg-card border border-compliant/30 hover:border-compliant/50 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="w-16 h-16 rounded-xl bg-compliant/10 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-compliant" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Compliant</h3>
                <p className="text-sm text-muted-foreground flex-1">Fully permissible with no purification required.</p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem className="h-full">
              <motion.div 
                className="h-full flex flex-col text-center p-8 rounded-2xl bg-card border border-warning/30 hover:border-warning/50 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="w-16 h-16 rounded-xl bg-warning/10 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Purification Required</h3>
                <p className="text-sm text-muted-foreground flex-1">Permissible but requires donation of impure income.</p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem className="h-full">
              <motion.div 
                className="h-full flex flex-col text-center p-8 rounded-2xl bg-card border border-destructive/30 hover:border-destructive/50 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="w-16 h-16 rounded-xl bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Non-Compliant</h3>
                <p className="text-sm text-muted-foreground flex-1">Not permissible due to core business or excessive impure income.</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
