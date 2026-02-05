import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Guards routes that require authentication
 * 
 * Usage:
 * <Route path="/feed" element={<ProtectedRoute><Home /></ProtectedRoute>} />
 * 
 * With profile completion check:
 * <Route path="/feed" element={<ProtectedRoute requireProfile><Home /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ 
  children, 
  requireProfile = false,
  redirectTo = '/login',
  profileRedirect = '/complete-profile'
}) {
  const { user, isLoading, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          <span className="text-sm text-slate-500">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    // Save the attempted URL for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if profile completion is required
  if (requireProfile && !user?.isProfileComplete) {
    return <Navigate to={profileRedirect} replace />;
  }

  return children;
}

/**
 * PublicRoute - Routes that should redirect if already authenticated
 * 
 * Usage:
 * <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */
export function PublicRoute({ 
  children, 
  redirectTo = '/feed' 
}) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          <span className="text-sm text-slate-500">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Already authenticated - redirect to intended destination or default
  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || redirectTo;
    return <Navigate to={destination} replace />;
  }

  return children;
}
