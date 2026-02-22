import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Board from "./pages/Board";
import Backlog from "./pages/Backlog";
import Sprints from "./pages/Sprints";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import EmailSent from "./pages/EmailSent";
import JWTLogin from "./pages/JWTLogin";
import SendOtp from "./pages/auth/SendOtp";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Register from "./pages/auth/Register";
import CreateOrganization from "./pages/auth/CreateOrganization";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ProjectList } from "./pages/projects/ProjectList";
import { CreateProject } from "./pages/projects/CreateProject";
import { ProjectDetail } from "./pages/projects/ProjectDetail";
import AcceptInvitation from "./pages/projects/AcceptInvitation";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes - No authentication required */}
              <Route path="/" element={<Login />} />
              <Route path="/auth/send-otp" element={<SendOtp />} />
              <Route path="/auth/verify-otp" element={<VerifyOtp />} />
              <Route path="/auth/create-organization" element={<CreateOrganization />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/verify" element={<VerifyEmail />} />
              <Route path="/email-sent" element={<EmailSent />} />
              <Route path="/jwt-login" element={<JWTLogin />} />

              {/* Project Invitation - Protected */}
              <Route path="/projects/invitation/:token" element={
                <ProtectedRoute>
                  <AcceptInvitation />
                </ProtectedRoute>
              } />

              {/* Protected Routes - Authentication required */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AuthProvider>
                    <Dashboard />
                  </AuthProvider>
                </ProtectedRoute>
              } />
              <Route path="/board" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <Board />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/backlog" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <Backlog />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/sprints" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <Sprints />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <Team />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <ProjectList />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/projects/create" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <CreateProject />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/projects/:id" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <ProjectDetail />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AppProvider>
                    <ProjectProvider>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </ProjectProvider>
                  </AppProvider>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
