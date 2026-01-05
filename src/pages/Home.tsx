import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, Eye, Users, BookOpen, BarChart3, Database, Brain, ArrowRight, 
  Globe, Target, DollarSign, Droplets, LogIn, UserCog, CheckCircle, 
  AlertTriangle, XCircle, Search, Briefcase, FileQuestion, MessageSquare,
  Sparkles, Zap
} from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Landing components
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { FeatureCard } from '@/components/landing/FeatureCard';
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

const features = [
  { 
    icon: Search, 
    title: 'Screen a Ticker', 
    description: 'Instantly check Shariah compliance using three independent methodologies with detailed analysis.', 
    path: '/screen',
    gradient: 'from-emerald-500/10 to-teal-500/5'
  },
  { 
    icon: Briefcase, 
    title: 'Dividends Purification', 
    description: 'Upload your portfolio to screen all positions and calculate purification amounts.', 
    path: '/portfolio',
    gradient: 'from-blue-500/10 to-cyan-500/5'
  },
  { 
    icon: FileQuestion, 
    title: 'Request Screening', 
    description: 'Submit a ticker for professional analysis by our Shariah advisory team.', 
    path: '/request',
    gradient: 'from-purple-500/10 to-indigo-500/5'
  },
  { 
    icon: MessageSquare, 
    title: 'AI Chat', 
    description: 'Get AI-powered explanations for screening results and Islamic finance guidance.', 
    path: '/chat',
    gradient: 'from-amber-500/10 to-orange-500/5'
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section - Enhanced */}
      <section ref={heroRef} id="hero" className="relative min-h-[100vh] flex items-center py-24 lg:py-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Floating particles */}
        <FloatingParticles count={30} />
        
        {/* Animated orbs */}
        <motion.div className="absolute inset-0 opacity-30" style={{ y: heroY }}>
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <motion.div 
          className="container relative z-10 px-4 sm:px-6"
          style={{ opacity: heroOpacity }}
        >
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm text-primary text-sm mb-8"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Shariah-Compliant Investment Solutions</span>
            </motion.div>
            
            {/* Main headline */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold mb-6 leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Invest with{' '}
              <GradientText>Confidence</GradientText>
              <br />
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-muted-foreground font-normal">
                Guided by Faith
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Screen stocks against multiple Shariah compliance methodologies with detailed analysis, 
              AI-powered insights, and purification calculations.
            </motion.p>
            
            {/* CTA buttons */}
            <motion.div 
              className="flex flex-wrap gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="btn-invesense text-base md:text-lg h-14 px-8 group"
                asChild
              >
                <Link to="/screen">
                  <Search className="w-5 h-5 mr-2" />
                  Screen a Ticker
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base md:text-lg h-14 px-8 border-primary/30 hover:bg-primary/10 hover:border-primary"
                asChild
              >
                <Link to="/portfolio">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Screen Portfolio
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                DFSA Regulated
              </span>
              <span className="w-px h-4 bg-border hidden sm:block" />
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-compliant" />
                5,000+ Stocks Screened
              </span>
              <span className="w-px h-4 bg-border hidden sm:block" />
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                AI-Powered Analysis
              </span>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.div 
            className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div 
              className="w-1 h-2 bg-primary rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>


      {/* Features Section - Enhanced */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">
              Powerful Tools for <GradientText>Ethical Investing</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make informed, Shariah-compliant investment decisions.
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.path}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                path={feature.path}
                gradient={feature.gradient}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Invesense */}
      <section id="about" className="py-20 lg:py-28 bg-card/50">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
            <p className="section-label">About Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">
              About <GradientText>Invesense</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Invesense is a global investment solution provider that achieves higher returns through a long-term, disciplined approach to Shariah-compliant investing.
            </p>
          </AnimatedSection>
          
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
      <section id="firm-overview" className="py-20 lg:py-28 bg-card/50">
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
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-8 lg:p-10 relative">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold mb-3">DFSA Regulated</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        Invesense Asset Management Limited is a DIFC registered Company and an Authorized Firm regulated by the Dubai Financial Services Authority (DFSA) under a Category 3C license, with reference number F002331.
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
      <section id="investing-approach" className="py-20 lg:py-28">
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
      <section id="screening-approach" className="py-20 lg:py-28 bg-card/50">
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
      <section id="methodology" className="py-20 lg:py-28">
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
            <StaggerItem>
              <motion.div 
                className="text-center p-8 rounded-2xl bg-card border border-compliant/30 hover:border-compliant/50 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="w-16 h-16 rounded-xl bg-compliant/10 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-compliant" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Compliant</h3>
                <p className="text-sm text-muted-foreground">Fully permissible with no purification required.</p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div 
                className="text-center p-8 rounded-2xl bg-card border border-warning/30 hover:border-warning/50 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="w-16 h-16 rounded-xl bg-warning/10 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Purification Required</h3>
                <p className="text-sm text-muted-foreground">Permissible but requires donation of impure income.</p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div 
                className="text-center p-8 rounded-2xl bg-card border border-destructive/30 hover:border-destructive/50 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="w-16 h-16 rounded-xl bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Non-Compliant</h3>
                <p className="text-sm text-muted-foreground">Not permissible due to core business or excessive impure income.</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>


    </div>
  );
}
