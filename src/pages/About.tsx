import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, Users, BookOpen, BarChart3, Database, Brain, ArrowRight } from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen overflow-hidden snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth">
      {/* Hero */}
      <section className="py-20 md:py-28 relative overflow-hidden snap-start snap-always min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div 
            className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">About Us</p>
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
                About <span className="text-primary">Invesense</span>
              </h1>
            </motion.div>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Invesense is a global investment solution provider that aims to achieve higher returns 
              and maintain a long-term disciplined approach to Shariah-compliant investing.
            </motion.p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Firm Overview */}
      <section className="py-20 md:py-28 bg-card/50 snap-start snap-always min-h-screen flex items-center">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Our Foundation</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Firm Overview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on decades of institutional experience and a commitment to Islamic finance principles.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={value.title}>
                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                    <Card className="border border-border hover:border-primary/30 transition-all bg-card h-full">
                      <CardContent className="p-8">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 mb-6 flex items-center justify-center">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-xl font-serif font-semibold mb-3">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Investing Approach */}
      <section className="py-20 md:py-28 snap-start snap-always min-h-screen flex items-center">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">How We Work</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Screening Approach</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our systematic approach combines traditional Islamic finance principles with modern technology.
            </p>
          </AnimatedSection>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {approach.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <motion.div 
                    className="text-center p-8"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Shariah Screening Platform */}
      <section className="py-20 md:py-28 bg-card/50 snap-start snap-always min-h-screen flex items-center">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Our Platform</p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Shariah Screening Platform</h2>
              <p className="text-muted-foreground">
                Our platform provides comprehensive Shariah compliance screening for equities worldwide.
              </p>
            </AnimatedSection>

            <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-12">
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="border border-compliant/30 bg-compliant/5">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-compliant mb-2">3</div>
                      <p className="text-sm text-muted-foreground">Independent Methodologies</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="border border-primary/30 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-primary mb-2">AI</div>
                      <p className="text-sm text-muted-foreground">Powered Explanations</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="border border-warning/30 bg-warning/5">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-warning mb-2">%</div>
                      <p className="text-sm text-muted-foreground">Purification Calculations</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>

            <AnimatedSection delay={0.4} className="text-center">
              <Button size="lg" className="btn-invesense group" asChild>
                <Link to="/screen">
                  Start Screening
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
