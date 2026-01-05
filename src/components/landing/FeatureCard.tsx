import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  gradient?: string;
  delay?: number;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  path, 
  gradient = 'from-primary/10 to-primary/5',
  delay = 0 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Link to={path} className="group block h-full">
        <div className={`relative h-full bg-gradient-to-br ${gradient} border border-border rounded-2xl p-6 md:p-8 overflow-hidden hover:border-primary/50 transition-all duration-300`}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Floating glow effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-primary/10 mb-5 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
              <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-4">
              {description}
            </p>
            
            <div className="flex items-center text-primary font-medium text-sm">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
