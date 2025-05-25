import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { getUserProfile } from "../../store/slices/authSlice";

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading, user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Check authentication on route enter or refresh
  useEffect(() => {
    // If not already authenticated and not currently loading
    if (!isAuthenticated && !loading) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated, loading]);

  // Show loading state while authentication is in progress
  if (loading) {
    return <div className="flex justify-center items-center py-10">Verifying admin access...</div>;
  }

  // If authentication is complete and user is not admin, redirect to home
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated and is an admin, render the protected content
  return children;
};

export default AdminRoute;
