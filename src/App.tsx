import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { OAuth2AuthProvider, useOAuth2Auth } from './context/OAuth2AuthContext';
import { DataProvider } from './context/DataContext';
import LoadingSkeleton from './components/UI/LoadingSkeleton';
import { performanceMonitor } from './utils/performance';

// Lazy load components for better performance
const OAuth2Login = React.lazy(() => import('./pages/OAuth2Login'));
const OAuth2Callback = React.lazy(() => import('./pages/OAuth2Callback'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));

// Keep existing pages but update authentication
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Inbox = React.lazy(() => import('./pages/Inbox'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));
const MessageDetails = React.lazy(() => import('./pages/MessageDetails'));
const GmailTest = React.lazy(() => import('./pages/GmailTest'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// New Gmail and Analytics pages
const GmailPage = React.lazy(() => import('./pages/GmailPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));

// Loading component
const LoadingSpinner = () => <LoadingSkeleton type="card" />;

// Protected Route Component - Using OAuth2 auth
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useOAuth2Auth();

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!user) {
    return <Navigate to="/oauth2-login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component - Using OAuth2 auth
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useOAuth2Auth();

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  // Performance monitoring in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log initial performance metrics after app loads
      const timer = setTimeout(() => {
        performanceMonitor.logPerformanceSummary();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const googleClientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <OAuth2AuthProvider>
        <DataProvider>
          <Router>
            <div className="App">
              <Routes>
              {/* Public Routes - OAuth2 only */}
                <Route
                  path="/login"
                  element={<Navigate to="/oauth2-login" replace />}
                />
                <Route
                  path="/register" 
                  element={<Navigate to="/oauth2-login" replace />}
                />
                <Route
                  path="/oauth2-login"
                  element={
                    <PublicRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <OAuth2Login />
                      </Suspense>
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth/callback"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <OAuth2Callback />
                    </Suspense>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PrivacyPolicy />
                    </Suspense>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Dashboard />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inbox"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Inbox />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inbox/:id"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <MessageDetails />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnalyticsPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gmail"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <GmailPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Settings />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gmail-test"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <GmailTest />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>


            </div>
          </Router>
        </DataProvider>
      </OAuth2AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;