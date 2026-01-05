import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  end, 
  duration = 2, 
  suffix = '', 
  prefix = '',
  decimals = 0 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * end * Math.pow(10, decimals)) / Math.pow(10, decimals);
      
      setCount(current);

      if (now < endTime) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration, decimals]);

  return (
    <motion.span 
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count}{suffix}
    </motion.span>
  );
}
