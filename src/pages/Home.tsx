import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Shield, ArrowRight, LogIn, UserCog, CheckCircle, 
  Search, Briefcase, FileQuestion, MessageSquare,
  Sparkles, Zap, LayoutDashboard
} from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// Landing components
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { GradientText } from '@/components/landing/GradientText';

const features = [
  { 
    icon: LayoutDashboard, 
    title: 'Dashboard', 
    description: 'Access your personalized dashboard with all screened stocks, compliance status, and portfolio insights in one place.', 
    path: '/dashboard',
    gradient: 'from-primary/15 to-primary/5',
    featured: true
  },
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
  const isMobile = useIsMobile();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} id="hero" className="relative min-h-[100vh] flex items-center py-24 lg:py-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <FloatingParticles count={30} />
        
        {/* Animated orbs - static on mobile */}
        {isMobile ? (
          <div className="absolute inset-0 opacity-20 overflow-hidden">
            <div className="absolute top-20 left-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>
        ) : (
          <motion.div className="absolute inset-0 opacity-30 overflow-hidden" style={{ y: heroY }}>
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
        )}
        
        {isMobile ? (
          <div className="container relative z-10 px-4 animate-fade-in">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Shariah-Compliant Investment Solutions</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-8 leading-[1.1]">
                Invest with{' '}
                <GradientText>Confidence</GradientText>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Screen stocks against Dalil Shariah screening methodology with detailed analysis, 
                AI-powered insights, purification calculation, and Zakat calculation.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                <Button size="lg" className="btn-dalil text-base h-14 px-8" asChild>
                  <Link to="/client-login">
                    <LogIn className="w-5 h-5 mr-2" />
                    Client Login
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  size="lg" variant="outline"
                  className="text-base h-14 px-8 border-primary/30 hover:bg-primary/10"
                  asChild
                >
                  <Link to="/screen">
                    <Search className="w-5 h-5 mr-2" />
                    Try Free Screening
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-16">
                <Link to="/staff-login" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <UserCog className="w-4 h-4" />
                  Staff Login
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  DFSA Regulated
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-compliant" />
                  5,000+ Stocks Screened
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  AI-Powered Analysis
                </span>
              </div>
            </div>
          </div>
        ) : (
          <motion.div className="container relative z-10 px-4 sm:px-6" style={{ opacity: heroOpacity }}>
            <div className="max-w-5xl mx-auto text-center">
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm text-primary text-sm mb-8"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Shariah-Compliant Investment Solutions</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold mb-8 leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Invest with{' '}
                <GradientText>Confidence</GradientText>
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Screen stocks against Dalil Shariah screening methodology with detailed analysis, 
                AI-powered insights, purification calculation, and Zakat calculation.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 justify-center mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button size="lg" className="btn-dalil text-base md:text-lg h-14 px-8 group" asChild>
                  <Link to="/client-login">
                    <LogIn className="w-5 h-5 mr-2" />
                    Client Login
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" variant="outline"
                  className="text-base md:text-lg h-14 px-8 border-primary/30 hover:bg-primary/10 hover:border-primary"
                  asChild
                >
                  <Link to="/screen">
                    <Search className="w-5 h-5 mr-2" />
                    Try Free Screening
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link to="/staff-login" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <UserCog className="w-4 h-4" />
                  Staff Login
                </Link>
              </motion.div>

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
        )}
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {!isMobile && (
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
        )}
      </section>

      {/* Features Section */}
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
                delay={isMobile ? 0 : index * 0.1}
                featured={'featured' in feature ? feature.featured : false}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
