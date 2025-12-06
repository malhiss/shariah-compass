import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import About from "./pages/About";
import TickerScreening from "./pages/TickerScreening";
import PortfolioScreening from "./pages/PortfolioScreening";
import ScreeningRequest from "./pages/ScreeningRequest";
import AiChat from "./pages/AiChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/screen" element={<TickerScreening />} />
            <Route path="/portfolio" element={<PortfolioScreening />} />
            <Route path="/request" element={<ScreeningRequest />} />
            <Route path="/chat" element={<AiChat />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
