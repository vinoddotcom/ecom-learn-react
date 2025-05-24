import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading, user } = useAppSelector(state => state.auth);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
