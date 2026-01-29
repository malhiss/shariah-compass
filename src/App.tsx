import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { clearCache } from "./lib/csv-data-loader";
import Home from "./pages/Home";
import Demo from "./pages/Demo";
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
import DemoDashboard from "./pages/DemoDashboard";
import DemoLogin from "./pages/DemoLogin";
import DemoRecordDetail from "./pages/DemoRecordDetail";
import NotFound from "./pages/NotFound";

// Clear cache on app load to ensure fresh data
clearCache();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Beta mode: Root redirects to demo */}
            <Route path="/" element={<Navigate to="/demo" replace />} />
            
            {/* Demo pages - public access during beta */}
            <Route path="/demo" element={<Demo />} />
            <Route path="/demo/login" element={<DemoLogin />} />
            <Route path="/demo/dashboard" element={<DemoDashboard />} />
            <Route path="/demo/record/:upsertKey" element={<DemoRecordDetail />} />
            
            {/* Staff routes - still accessible */}
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/setup" element={<SetupStaff />} />
            <Route element={<Layout />}>
              <Route 
                path="/staff-portal" 
                element={
                  <ProtectedRoute requireRole="staff">
                    <StaffPortal />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* All other routes redirect to demo during beta */}
            <Route path="/about" element={<Navigate to="/demo" replace />} />
            <Route path="/screen" element={<Navigate to="/demo" replace />} />
            <Route path="/portfolio" element={<Navigate to="/demo" replace />} />
            <Route path="/request" element={<Navigate to="/demo" replace />} />
            <Route path="/chat" element={<Navigate to="/demo" replace />} />
            <Route path="/dashboard" element={<Navigate to="/demo" replace />} />
            <Route path="/shariah-dashboard" element={<Navigate to="/demo" replace />} />
            <Route path="/my-activity" element={<Navigate to="/demo" replace />} />
            <Route path="/client-login" element={<Navigate to="/demo/login" replace />} />
            <Route path="/record/:upsertKey" element={<Navigate to="/demo" replace />} />
            <Route path="/memos" element={<Navigate to="/demo" replace />} />
            <Route path="/memos/:id" element={<Navigate to="/demo" replace />} />
            <Route path="/leadership" element={<Navigate to="/demo" replace />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/demo" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
