import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Shield, Eye, Users, BookOpen, BarChart3, Database, Brain, ArrowRight, 
  Globe, Target, DollarSign, Droplets, LogIn, UserCog, Scale, CheckCircle, 
  AlertTriangle, XCircle, Search, Briefcase, FileQuestion, MessageSquare,
  ChevronRight, ChevronLeft, Menu
} from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

// Import team images
import faisalImg from '@/assets/team/faisal-al-osaimi.png';
import nawafImg from '@/assets/team/nawaf-al-mansour.png';
import mathewsImg from '@/assets/team/mathews-b-abraham.png';
import ahmedImg from '@/assets/team/ahmed-ali.png';
import ibrahimImg from '@/assets/team/ibrahim-al-shaibani.png';

const teamMembers = [
  {
    name: 'Faisal Al Osaimi',
    role: 'CEO',
    image: faisalImg,
    bio: 'Certified portfolio and wealth manager with 18 years\' experience in trading, dealing, and senior executive management at KFIC Asset Management.',
  },
  {
    name: 'Nawaf Al Mansour',
    role: 'CIO',
    image: nawafImg,
    bio: 'Chartered Financial Analyst with 20 years of experience, previously managing billions at Kuwait Investment Authority.',
  },
  {
    name: 'Mathews B Abraham',
    role: 'Chief - Finance & Operations',
    image: mathewsImg,
    bio: 'CIPM holder with 23+ years of experience in risk analysis, financial reporting, and market tracking.',
  },
  {
    name: 'Ahmed Ali',
    role: 'Portfolio Manager',
    image: ahmedImg,
    bio: 'Former Morgan Stanley intern and KIA graduate with global and regional portfolio experience.',
  },
  {
    name: 'Ibrahim Al Shaibani',
    role: 'Portfolio Manager',
    image: ibrahimImg,
    bio: 'Former intern at Kuwait Investment Office London with global multi-asset experience.',
  },
  {
    name: 'Tahira Muktar',
    role: 'Head of Sales',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FIMG_2760a_2.jpg&w=1080&q=75',
    bio: '16+ years of experience, previously with Dimensional Fund Advisors developing client relations in the Middle East.',
  },
];

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

const screeningMethodologies = [
  {
    name: 'Invesense Methodology',
    description: 'Comprehensive screening using financial ratios, qualitative analysis, and AI-powered haram sector estimation.',
    icon: Scale,
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
  { icon: Search, title: 'Screen a Ticker', description: 'Check Shariah compliance using three independent methodologies.', path: '/screen' },
  { icon: Briefcase, title: 'Dividends Purification', description: 'Upload your portfolio to screen all positions at once.', path: '/portfolio' },
  { icon: FileQuestion, title: 'Request Screening', description: 'Submit a ticker for analysis.', path: '/request' },
  { icon: MessageSquare, title: 'AI Chat', description: 'Get AI-powered explanations for screening results.', path: '/chat' },
];

export default function Home() {
  const [featuresRef, featuresApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [featuresIndex, setFeaturesIndex] = useState(0);

  const onFeaturesSelect = useCallback(() => {
    if (!featuresApi) return;
    setFeaturesIndex(featuresApi.selectedScrollSnap());
  }, [featuresApi]);

  useEffect(() => {
    if (!featuresApi) return;
    onFeaturesSelect();
    featuresApi.on('select', onFeaturesSelect);
    return () => { featuresApi.off('select', onFeaturesSelect); };
  }, [featuresApi, onFeaturesSelect]);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div className="absolute inset-0 opacity-20" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 1.5 }}>
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Scale className="w-4 h-4" />
              <span>Shariah-Compliant Investment Solutions</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Invest with <span className="text-primary">Confidence</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Screen stocks against multiple Shariah compliance methodologies with detailed analysis, clear classifications, and purification requirements.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-3 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isPrimary = index === 0;
                return (
                  <Button 
                    key={feature.path}
                    size="lg" 
                    variant={isPrimary ? "default" : "outline"}
                    className={isPrimary ? "btn-invesense text-base group" : "text-base group"}
                    asChild
                  >
                    <Link to={feature.path}>
                      <Icon className="w-5 h-5 mr-2" />
                      {feature.title}
                      {isPrimary && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Link>
                  </Button>
                );
              })}
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* About Invesense */}
      <section id="about" className="py-20 lg:py-28 bg-card/50">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
            <p className="section-label">About Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">About Invesense</h2>
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
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-8 lg:p-10">
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

      {/* Invesense Screening Methodology */}
      <section id="methodology" className="py-20 lg:py-28 bg-card/50">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">Our Approach</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">Invesense Screening Methodology</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each ticker is screened against multiple methodologies, giving you a comprehensive view of compliance status.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid gap-6 max-w-xl mx-auto mb-12">
            {screeningMethodologies.map((method) => {
              const Icon = method.icon;
              return (
                <StaggerItem key={method.name} className="h-full">
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="h-full group hover:border-primary/40 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{method.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{method.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Compliance Status Cards */}
          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <StaggerItem>
              <motion.div 
                className="text-center p-6 rounded-2xl bg-background border border-compliant/30 hover:border-compliant/50 transition-colors"
                whileHover={{ y: -4 }}
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
                className="text-center p-6 rounded-2xl bg-background border border-warning/30 hover:border-warning/50 transition-colors"
                whileHover={{ y: -4 }}
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
                className="text-center p-6 rounded-2xl bg-background border border-destructive/30 hover:border-destructive/50 transition-colors"
                whileHover={{ y: -4 }}
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

      {/* Leadership */}
      <section id="leadership" className="py-20 lg:py-28">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">Our Team</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">Leadership</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Decades of combined experience in institutional asset management and Islamic finance.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <StaggerItem key={member.name}>
                <motion.div 
                  className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300"
                  whileHover={{ y: -6 }}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold mb-1">{member.name}</h3>
                    <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-20 lg:py-28 bg-card/50">
        <div className="container px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="section-label">Platform</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">Get Started</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our suite of tools designed for Shariah-compliant investing.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2} className="max-w-6xl mx-auto">
            <div className="relative">
              <button
                onClick={() => featuresApi?.scrollPrev()}
                className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => featuresApi?.scrollNext()}
                className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="overflow-hidden" ref={featuresRef}>
                <div className="flex">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.path} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] px-3">
                        <Link to={feature.path} className="group block h-full">
                          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                            <Card className="h-full min-h-[200px] group-hover:border-primary/40">
                              <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                  <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                                </div>
                                <CardTitle className="text-base group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                                <CardDescription>{feature.description}</CardDescription>
                              </CardHeader>
                            </Card>
                          </motion.div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => featuresApi?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === featuresIndex ? 'bg-primary w-6' : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />
        <motion.div className="absolute inset-0 opacity-20" initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} viewport={{ once: true }}>
          <motion.div 
            className="absolute top-10 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <div className="container relative z-10 px-4 sm:px-6">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6">Ready to Screen Your Investments?</h2>
            <p className="text-lg text-muted-foreground mb-10">Start screening your portfolio for Shariah compliance today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-invesense group" asChild>
                <Link to="/client-login">
                  <LogIn className="w-5 h-5 mr-2" />
                  Client Login
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/staff-login">
                  <UserCog className="w-5 h-5 mr-2" />
                  Staff Login
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
