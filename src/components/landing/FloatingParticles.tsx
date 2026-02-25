import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));
};

export function FloatingParticles({ count = 20 }: { count?: number }) {
  const isMobile = useIsMobile();
  const particleCount = isMobile ? Math.min(count, 8) : count;
  const particles = useMemo(() => generateParticles(particleCount), [particleCount]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/20 animate-float-particle"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
