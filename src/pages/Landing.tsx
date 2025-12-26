import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, Briefcase, FileQuestion, MessageSquare, Scale, CheckCircle, AlertTriangle, XCircle, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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
  // Methodologies carousel
  const [methodsRef, methodsApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );
  const [methodsIndex, setMethodsIndex] = useState(0);

  // Features carousel
  const [featuresRef, featuresApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [featuresIndex, setFeaturesIndex] = useState(0);

  const onMethodsSelect = useCallback(() => {
    if (!methodsApi) return;
    setMethodsIndex(methodsApi.selectedScrollSnap());
  }, [methodsApi]);

  const onFeaturesSelect = useCallback(() => {
    if (!featuresApi) return;
    setFeaturesIndex(featuresApi.selectedScrollSnap());
  }, [featuresApi]);

  useEffect(() => {
    if (!methodsApi) return;
    onMethodsSelect();
    methodsApi.on('select', onMethodsSelect);
    return () => {
      methodsApi.off('select', onMethodsSelect);
    };
  }, [methodsApi, onMethodsSelect]);

  useEffect(() => {
    if (!featuresApi) return;
    onFeaturesSelect();
    featuresApi.on('select', onFeaturesSelect);
    return () => {
      featuresApi.off('select', onFeaturesSelect);
    };
  }, [featuresApi, onFeaturesSelect]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{ 
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Scale className="w-4 h-4" />
              <span>Shariah-Compliant Investment Screening</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-foreground">Invest with </span>
              <span className="text-primary">Confidence</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Screen stocks against multiple Shariah compliance methodologies. 
              Get detailed analysis with clear classifications and purification requirements.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
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
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* What is Shariah Screening */}
      <section className="py-20 md:py-28 bg-card/50 min-h-screen flex items-center">
        <div className="container">
          <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Understanding Compliance</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              What is Shariah Screening?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Shariah screening evaluates whether an investment complies with Islamic principles. 
              It examines a company's business activities and financial ratios to determine permissibility.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StaggerItem>
              <motion.div 
                className="text-center p-8 rounded-2xl bg-background border border-border hover:border-compliant/50 transition-colors group"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-20 h-20 rounded-2xl bg-compliant/10 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-10 h-10 text-compliant" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">Compliant</h3>
                <p className="text-muted-foreground">
                  Fully permissible for Islamic investment with no purification required.
                </p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div 
                className="text-center p-8 rounded-2xl bg-background border border-border hover:border-warning/50 transition-colors group"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-20 h-20 rounded-2xl bg-warning/10 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-10 h-10 text-warning" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">Purification Required</h3>
                <p className="text-muted-foreground">
                  Permissible but requires donation of impure income portion as purification.
                </p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div 
                className="text-center p-8 rounded-2xl bg-background border border-border hover:border-destructive/50 transition-colors group"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-20 h-20 rounded-2xl bg-destructive/10 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">Non-Compliant</h3>
                <p className="text-muted-foreground">
                  Not permissible due to core business or excessive impure income.
                </p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Methodologies */}
      <section className="py-20 md:py-28 min-h-screen flex items-center">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Our Approach</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Three Independent Methodologies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each ticker is screened against three methodologies, giving you a comprehensive view of compliance status.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {methodologies.map((method) => {
              const Icon = method.icon;
              return (
                <StaggerItem key={method.name} className="h-full">
                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
                    <Card className="premium-card group relative overflow-hidden h-full flex flex-col min-h-[280px]">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 mb-6 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <CardTitle className="font-serif text-xl">{method.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-muted-foreground leading-relaxed">{method.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Grid - Auto-scrolling Carousel */}
      <section className="py-20 md:py-28 bg-card/50 min-h-screen flex items-center">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Platform Features</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Get Started
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our suite of tools designed for Shariah-compliant investing.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2} className="max-w-6xl mx-auto">
            <div className="relative">
              {/* Navigation buttons */}
              <button
                onClick={() => featuresApi?.scrollPrev()}
                className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => featuresApi?.scrollNext()}
                className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Carousel */}
              <div className="overflow-hidden" ref={featuresRef}>
                <div className="flex">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.path} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] px-4">
                        <Link to={feature.path} className="group block h-full">
                          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
                            <Card className="premium-card h-full min-h-[220px]">
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
                          </motion.div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dots */}
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
      <section className="py-20 md:py-28 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />
        <motion.div 
          className="absolute inset-0 opacity-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="absolute top-10 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <div className="container relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Ready to Screen Your Investments?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Start screening your portfolio for Shariah compliance today.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
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
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
