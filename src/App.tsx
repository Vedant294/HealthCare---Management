import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Resources from "./pages/Resources";
import EmergencyQueue from "./pages/EmergencyQueue";
import CrisisPanel from "./pages/CrisisPanel";
import ServiceRequests from "./pages/ServiceRequests";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import SettingsPage from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<P><Index /></P>} />
                <Route path="/appointments" element={<P><Appointments /></P>} />
                <Route path="/patients" element={<P><Patients /></P>} />
                <Route path="/doctors" element={<P><Doctors /></P>} />
                <Route path="/resources" element={<P><Resources /></P>} />
                <Route path="/emergency" element={<P><EmergencyQueue /></P>} />
                <Route path="/crisis" element={<P><CrisisPanel /></P>} />
                <Route path="/service-requests" element={<P><ServiceRequests /></P>} />
                <Route path="/reports" element={<P><Reports /></P>} />
                <Route path="/notifications" element={<P><Notifications /></P>} />
                <Route path="/audit-logs" element={<P><AuditLogs /></P>} />
                <Route path="/settings" element={<P><SettingsPage /></P>} />
                <Route path="/profile" element={<P><Profile /></P>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
