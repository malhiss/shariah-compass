import { Outlet, Link, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { PageTransition } from './PageTransition';
import { ScrollToTop } from './ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import dalilLogo from '@/assets/dalil-logo.png';

const footerLinks = {
  screening: [
    { label: 'Screen a Ticker', path: '/screen' },
    { label: 'Dividends Purification', path: '/portfolio' },
    { label: 'Request Screening', path: '/request' },
    { label: 'AI Chat', path: '/chat' },
  ],
};

export function Layout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container py-12 lg:py-16 px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="inline-block mb-6">
                <img src={dalilLogo} alt="Dalil" className="h-[101px] lg:h-[115px] w-auto" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Shariah-compliant investment screening powered by Dalil methodology. Make informed investment decisions aligned with Islamic principles.
              </p>
            </div>
            
            {/* Screening Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Screening</h4>
              <ul className="space-y-3">
                {footerLinks.screening.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Dalil. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground text-center md:text-right">
                For informational purposes only. Consult a qualified scholar for definitive rulings.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
