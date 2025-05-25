import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { RouteType } from "./routeConfig";

interface RouteGuardProps {
  children: React.ReactElement;
  routeType: RouteType;
}

/**
 * A unified route guard component that handles different route types:
 * - Public routes: render immediately without waiting for auth
 * - Protected routes: require authentication
 * - Admin routes: require authentication and admin role
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children, routeType }) => {
  const { isAuthenticated, loading, user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Track if we've attempted to check authentication
  const [authCheckAttempted, setAuthCheckAttempted] = React.useState(false);

  // Always run the effect for any route type, but only take action for protected/admin routes
  useEffect(() => {
    // Skip auth check for public routes
    if (routeType === RouteType.PUBLIC) {
      return;
    }

    // For protected and admin routes, check authentication
    if (!isAuthenticated && !loading) {
    //   dispatch(getUserProfile());
      setAuthCheckAttempted(true);
    } else if (!loading) {
      // If we're not loading and we have auth status, mark check as attempted
      setAuthCheckAttempted(true);
    }
  }, [dispatch, isAuthenticated, loading, routeType]);

  // For public routes, render immediately without waiting
  if (routeType === RouteType.PUBLIC) {
    return children;
  }

  // Always show loading state during the initial authentication check
  // This prevents immediate redirect to signin page before the check completes
  if (loading || (!isAuthenticated && !authCheckAttempted)) {
    return (
      <div className="flex justify-center items-center py-10">
        {routeType === RouteType.ADMIN
          ? "Verifying admin access..."
          : "Verifying authentication..."}
      </div>
    );
  }

  // Only redirect to sign in if authentication check has been attempted and failed
  if (!isAuthenticated && authCheckAttempted) {
    // Store the location they were trying to access for potential redirect after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // For admin routes, check admin role
  if (routeType === RouteType.ADMIN && user?.role !== "admin") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If all checks pass, render the protected content
  return children;
};

export default RouteGuard;
