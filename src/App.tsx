import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { useNotificationPolling } from './hooks/useNotificationPolling';
import { ToastContainer } from './components/ui/Toast';
import { NotificationBell } from './components/NotificationBell';
import { NotificationPanel } from './components/NotificationPanel';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Board = lazy(() => import('./pages/Board'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Session initialization component
const SessionInitializer = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const revalidateSession = useAuthStore((state) => state.revalidateSession);
  const loadFromStorage = useNotificationStore((state) => state.loadFromStorage);

  useEffect(() => {
    // Revalidate session on app mount
    if (!isAuthenticated) {
      revalidateSession();
    }
    // Load notifications from storage
    loadFromStorage();
  }, [isAuthenticated, revalidateSession, loadFromStorage]);

  // Show loading state while checking session
  if (isLoading) {
    return <LoadingFallback />;
  }

  return <>{children}</>;
};

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Initialize notification polling
  useNotificationPolling();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionInitializer>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/board"
                element={
                  <ProtectedRoute>
                    <Board />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </SessionInitializer>
        
        {/* Global UI Components */}
        <ToastContainer />
        <NotificationBell />
        <NotificationPanel />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
