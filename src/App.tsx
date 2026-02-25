import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { SEOHead } from "./components/SEOHead";
import Home from "./pages/Home";
import About from "./pages/About";
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
import RecordDetail from "./pages/RecordDetail";
import Memos from "./pages/Memos";
import MemoDetail from "./pages/MemoDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <SEOHead />
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/client-login" element={<ClientLogin />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/setup" element={<SetupStaff />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes with Layout (sidebar + header) */}
              <Route element={<Layout />}>
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <ShariahDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shariah-dashboard" 
                  element={<Navigate to="/dashboard" replace />} 
                />
                <Route 
                  path="/record/:upsertKey" 
                  element={
                    <ProtectedRoute>
                      <RecordDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/screen" 
                  element={
                    <ProtectedRoute>
                      <TickerScreening />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/portfolio" 
                  element={
                    <ProtectedRoute>
                      <PortfolioScreening />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/request" 
                  element={
                    <ProtectedRoute>
                      <ScreeningRequest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <AiChat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-activity" 
                  element={
                    <ProtectedRoute>
                      <ClientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/memos" 
                  element={
                    <ProtectedRoute>
                      <Memos />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/memos/:id" 
                  element={
                    <ProtectedRoute>
                      <MemoDetail />
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
              </Route>

              {/* Demo routes redirect to main site */}
              <Route path="/demo" element={<Navigate to="/" replace />} />
              <Route path="/demo/login" element={<Navigate to="/client-login" replace />} />
              <Route path="/demo/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/demo/record/:upsertKey" element={<Navigate to="/dashboard" replace />} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
