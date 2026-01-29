import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  gradient?: string;
  delay?: number;
  featured?: boolean;
  comingSoon?: boolean;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  path, 
  gradient = 'from-primary/10 to-primary/5',
  delay = 0,
  featured = false,
  comingSoon = false
}: FeatureCardProps) {
  const cardContent = (
    <div className={cn(
      `relative h-full bg-gradient-to-br ${gradient} border border-border rounded-2xl overflow-hidden transition-all duration-300`,
      featured ? "p-8 md:p-10" : "p-6 md:p-8",
      !comingSoon && "hover:border-primary/50",
      comingSoon && "opacity-70"
    )}>
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 border border-border text-xs font-medium text-muted-foreground">
            <Clock className="w-3 h-3" />
            Coming Soon
          </div>
        </div>
      )}

      {/* Animated gradient overlay - only for non-coming-soon */}
      {!comingSoon && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Floating glow effect - only for non-coming-soon */}
      {!comingSoon && (
        <div className={cn(
          "absolute bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
          featured ? "-top-32 -right-32 w-64 h-64" : "-top-24 -right-24 w-48 h-48"
        )} />
      )}
      
      <div className={cn(
        "relative z-10",
        featured && "md:flex md:items-center md:gap-8"
      )}>
        <div className={cn(
          "rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 shrink-0",
          featured ? "w-16 h-16 md:w-20 md:h-20 mb-6 md:mb-0" : "w-14 h-14 mb-5",
          !comingSoon && "group-hover:bg-primary group-hover:scale-110"
        )}>
          <Icon className={cn(
            "text-primary transition-colors duration-300",
            featured ? "w-8 h-8 md:w-10 md:h-10" : "w-7 h-7",
            !comingSoon && "group-hover:text-primary-foreground"
          )} />
        </div>
        
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-foreground transition-colors duration-300",
            featured ? "text-2xl md:text-3xl mb-3" : "text-xl mb-3",
            !comingSoon && "group-hover:text-primary"
          )}>
            {title}
          </h3>
          
          <p className={cn(
            "text-muted-foreground leading-relaxed",
            featured ? "text-base md:text-lg mb-5" : "mb-4"
          )}>
            {description}
          </p>
          
          {!comingSoon && (
            <div className={cn(
              "flex items-center text-primary font-medium",
              featured ? "text-base" : "text-sm"
            )}>
              <span>{featured ? "Go to Dashboard" : "Get started"}</span>
              <ArrowRight className={cn(
                "ml-2 group-hover:translate-x-2 transition-transform duration-300",
                featured ? "w-5 h-5" : "w-4 h-4"
              )} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={cn("h-full", featured && "md:col-span-2")}
    >
      {comingSoon ? (
        <div className="block h-full cursor-default">
          {cardContent}
        </div>
      ) : (
        <Link to={path} className="group block h-full">
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
}
