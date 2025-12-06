import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>Shariah Screening Application — Powered by Invesense Methodology</p>
          <p className="mt-1">For informational purposes only. Consult a qualified scholar for definitive rulings.</p>
        </div>
      </footer>
    </div>
  );
}
