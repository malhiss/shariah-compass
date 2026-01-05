import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export function TestimonialCard({ quote, author, role, company }: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <div className="relative h-full bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/40 transition-all duration-300">
        <Quote className="w-10 h-10 text-primary/20 mb-4" />
        <blockquote className="text-foreground text-lg leading-relaxed mb-6">
          "{quote}"
        </blockquote>
        <div className="mt-auto">
          <p className="font-semibold text-foreground">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
          <p className="text-sm text-primary">{company}</p>
        </div>
      </div>
    </motion.div>
  );
}
