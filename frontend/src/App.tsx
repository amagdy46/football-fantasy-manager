import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth, AuthPage } from "./modules/auth";
import { LoadingPage, DashboardPage } from "./modules/team/pages";
import { TransferMarketPage } from "./modules/transfers";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/loading"
              element={
                <ProtectedRoute>
                  <LoadingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transfers"
              element={
                <ProtectedRoute>
                  <TransferMarketPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/loading" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
