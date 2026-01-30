import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Shield, ArrowRight, CheckCircle, 
  Search, Briefcase, FileQuestion, MessageSquare,
  Sparkles, Zap, LayoutDashboard, Mail
} from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { motion, useScroll, useTransform } from 'framer-motion';

// Landing components
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { GradientText } from '@/components/landing/GradientText';
import { InvitationDialog } from '@/components/InvitationDialog';
import { DemoHeader } from '@/components/DemoHeader';

const features = [
  { 
    icon: LayoutDashboard, 
    title: 'Dashboard', 
    description: 'Access your personalized dashboard with all screened stocks, compliance status, and portfolio insights in one place.', 
    path: '/demo/dashboard',
    gradient: 'from-primary/15 to-primary/5',
    featured: true,
    comingSoon: false
  },
  { 
    icon: Search, 
    title: 'Screen a Ticker', 
    description: 'Instantly check Shariah compliance using three independent methodologies with detailed analysis.', 
    path: '/screen',
    gradient: 'from-emerald-500/10 to-teal-500/5',
    comingSoon: true
  },
  { 
    icon: Briefcase, 
    title: 'Dividends Purification', 
    description: 'Upload your portfolio to screen all positions and calculate purification amounts.', 
    path: '/portfolio',
    gradient: 'from-blue-500/10 to-cyan-500/5',
    comingSoon: true
  },
  { 
    icon: FileQuestion, 
    title: 'Request Screening', 
    description: 'Submit a ticker for professional analysis by our Shariah advisory team.', 
    path: '/request',
    gradient: 'from-purple-500/10 to-indigo-500/5',
    comingSoon: true
  },
  { 
    icon: MessageSquare, 
    title: 'AI Chat', 
    description: 'Get AI-powered explanations for screening results and Islamic finance guidance.', 
    path: '/chat',
    gradient: 'from-amber-500/10 to-orange-500/5',
    comingSoon: true
  },
];

export default function Demo() {
  const [invitationOpen, setInvitationOpen] = useState(false);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <DemoHeader />
      <div className="overflow-x-hidden">
      {/* Invitation Dialog */}
      <InvitationDialog open={invitationOpen} onOpenChange={setInvitationOpen} />
      {/* Hero Section - Enhanced */}
      <section ref={heroRef} id="hero" className="relative min-h-[100vh] flex items-center py-24 lg:py-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Floating particles */}
        <FloatingParticles count={30} />
        
        {/* Animated orbs - contained within bounds */}
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
              <span className="font-medium">Exclusive Demo Access</span>
            </motion.div>
            
            {/* Main headline */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold mb-8 leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Invest with{' '}
              <GradientText>Confidence</GradientText>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Screen stocks against Dalil Shariah screening methodology with detailed analysis, 
              AI-powered insights, purification calculation, and Zakat calculation.
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
                className="btn-dalil text-base md:text-lg h-14 px-10 group"
                onClick={() => setInvitationOpen(true)}
              >
                <Mail className="w-5 h-5 mr-2" />
                Get an Invitation!
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base md:text-lg h-14 px-10 border-primary/30 hover:bg-primary/10"
                asChild
              >
                <Link to="/demo/login">
                  I Have an Invitation
                </Link>
              </Button>
            </motion.div>
            
            {/* Staff Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mb-16"
            >
              <Link 
                to="/staff-login" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Staff Login
              </Link>
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
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                path={feature.path}
                comingSoon={feature.comingSoon}
                gradient={feature.gradient}
                delay={index * 0.1}
                featured={'featured' in feature ? feature.featured : false}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
