import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
}

export function StatCard({ icon: Icon, value, suffix = '', prefix = '', label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
      <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 text-center hover:border-primary/40 transition-all duration-300">
        <div className="w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          <AnimatedCounter end={value} suffix={suffix} prefix={prefix} />
        </div>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </motion.div>
  );
}
