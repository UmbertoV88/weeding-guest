import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotificationProvider from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Tables from "./pages/Tables";
import TablePlanner from "./components/TablePlanner";
import TablePlannerDemo from "./components/TablePlannerDemo";
import TablePlannerReal from "./components/TablePlannerReal";
import TablePlannerTest from "./components/TablePlannerTest";
import DatabaseSchemaFix from "./components/DatabaseSchemaFix";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import QRLanding from "./pages/QRLanding";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/tavoli" element={
                <ProtectedRoute>
                  <TablePlanner />
                </ProtectedRoute>
              } />
              <Route path="/tavoli-demo" element={<TablePlannerDemo />} />
              <Route path="/tavoli-real" element={<TablePlannerReal />} />
              <Route path="/tavoli-test" element={<TablePlannerTest />} />
              <Route path="/database-fix" element={<DatabaseSchemaFix />} />
              {/* QR Code Landing Pages */}
              <Route path="/rsvp/:token" element={<QRLanding />} />
              <Route path="/checkin/:token" element={<QRLanding />} />
              <Route path="/wedding-info/:token" element={<QRLanding />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;