import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Leadership from "./pages/Leadership";
import TickerScreening from "./pages/TickerScreening";
import PortfolioScreening from "./pages/PortfolioScreening";
import ScreeningRequest from "./pages/ScreeningRequest";
import AiChat from "./pages/AiChat";
import ClientLogin from "./pages/ClientLogin";
import StaffLogin from "./pages/StaffLogin";
import StaffPortal from "./pages/StaffPortal";
import SetupStaff from "./pages/SetupStaff";
import ClientDashboard from "./pages/ClientDashboard";
import ShariahDashboard from "./pages/ShariahDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route 
                path="/screen" 
                element={
                  <ProtectedRoute requireRole="any">
                    <TickerScreening />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/portfolio" 
                element={
                  <ProtectedRoute requireRole="any">
                    <PortfolioScreening />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/request" 
                element={
                  <ProtectedRoute requireRole="any">
                    <ScreeningRequest />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute requireRole="any">
                    <AiChat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-activity" 
                element={
                  <ProtectedRoute requireRole="any">
                    <ClientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff-portal" 
                element={
                  <ProtectedRoute requireRole="staff">
                    <StaffPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shariah-dashboard" 
                element={
                  <ProtectedRoute requireRole="any">
                    <ShariahDashboard />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/setup" element={<SetupStaff />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
