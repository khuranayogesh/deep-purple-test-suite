import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FolderManagement from "./pages/admin/FolderManagement";
import ScriptManagement from "./pages/admin/ScriptManagement";
import ScriptListing from "./pages/admin/ScriptListing";
import UserDashboard from "./pages/user/UserDashboard";
import CreateProject from "./pages/user/CreateProject";
import ImportScripts from "./pages/user/ImportScripts";
import TestLab from "./pages/user/TestLab";
import IssueLog from "./pages/user/IssueLog";
import ScriptExecution from "./pages/user/ScriptExecution";
import NotFound from "./pages/NotFound";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="Administrator">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/folders" element={
            <ProtectedRoute requiredRole="Administrator">
              <FolderManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/scripts" element={
            <ProtectedRoute requiredRole="Administrator">
              <ScriptManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/scripts/:scriptId" element={
            <ProtectedRoute requiredRole="Administrator">
              <ScriptManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/listing" element={
            <ProtectedRoute requiredRole="Administrator">
              <ScriptListing />
            </ProtectedRoute>
          } />
          
          {/* User Routes */}
          <Route path="/user" element={
            <ProtectedRoute requiredRole="User">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user/create-project" element={
            <ProtectedRoute requiredRole="User">
              <CreateProject />
            </ProtectedRoute>
          } />
          <Route path="/user/project/:projectId/import" element={
            <ProtectedRoute requiredRole="User">
              <ImportScripts />
            </ProtectedRoute>
          } />
          <Route path="/user/project/:projectId/test-lab" element={
            <ProtectedRoute requiredRole="User">
              <TestLab />
            </ProtectedRoute>
          } />
          <Route path="/user/project/:projectId/issues" element={
            <ProtectedRoute requiredRole="User">
              <IssueLog />
            </ProtectedRoute>
          } />
          <Route path="/user/project/:projectId/script/:scriptId" element={
            <ProtectedRoute requiredRole="User">
              <ScriptExecution />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
