import { Outlet, Link, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { PageTransition } from './PageTransition';
import { ScrollToTop } from './ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import invesenseLogo from '@/assets/invesense-logo.png';

const footerLinks = {
  screening: [
    { label: 'Screen a Ticker', path: '/screen' },
    { label: 'Portfolio Screening', path: '/portfolio' },
    { label: 'Request a Screening', path: '/request' },
    { label: 'AI Chat', path: '/chat' },
  ],
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Leadership', path: '/leadership' },
  ],
};

export function Layout() {
  const location = useLocation();
  
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <ScrollToTop />
      <Header />
      <main className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      
        {/* Footer */}
        <footer className="border-t border-border bg-card/50">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="inline-block mb-6">
                <img src={invesenseLogo} alt="Invesense" className="h-10 w-auto" />
              </Link>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                Shariah-compliant investment screening powered by Invesense methodology. 
                Make informed investment decisions aligned with Islamic principles.
              </p>
            </div>
            
            {/* Screening Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Screening</h4>
              <ul className="space-y-3">
                {footerLinks.screening.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path}
                      className="text-muted-foreground hover:text-primary transition-colors"
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
                © {new Date().getFullYear()} Invesense. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground text-center md:text-right">
                For informational purposes only. Consult a qualified scholar for definitive rulings.
              </p>
            </div>
          </div>
        </div>
        </footer>
      </main>
    </div>
  );
}
