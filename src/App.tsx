import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import Skeleton from './components/ui/Skeleton';

const Home = lazy(() => import('./pages/Home'));
const Workspace = lazy(() => import('./pages/Workspace'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const Auth = lazy(() => import('./pages/Auth'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <Skeleton className="h-64 w-full max-w-2xl" />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {!isHome && <Navbar />}
      <div className="flex flex-1">
        {user && <Sidebar />}
        <main id="main-content" className="flex-1">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/workspace"
                  element={user ? <Workspace /> : <Navigate to="/auth" />}
                />
                <Route
                  path="/history"
                  element={user ? <History /> : <Navigate to="/auth" />}
                />
                <Route
                  path="/settings"
                  element={user ? <Settings /> : <Navigate to="/auth" />}
                />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      {!isHome && <Footer />}
    </div>
  );
}
