import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SignIn from "./components/auth/signIn";
import SignUp from "./components/auth/signUp";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import AdminProductList from "./components/admin/AdminProductList";
import AdminProductForm from "./components/admin/AdminProductForm";
import AdminRoute from "./components/routes/AdminRoute";
import { getUserProfile } from "./store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

// Define our ProtectedRoute component that checks auth but doesn't block the whole app
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    // Try to authenticate if not already authenticated and not currently loading
    if (!isAuthenticated && !loading) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">Verifying authentication...</div>
    );
  }

  if (!isAuthenticated) {
    // Store the location they were trying to access for potential redirect after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Start authentication check in background without blocking rendering
    dispatch(getUserProfile());
  }, [dispatch]); // Only runs once on mount

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main className="min-h-screen">
          <Routes>
            {/* Public routes - load immediately without waiting for auth */}
            <Route path="/" element={<div className="mt-5 text-center">Home Page</div>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected routes - check auth status before rendering */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="mt-5 text-center">Profile Page (Protected)</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <div className="mt-5 text-center">Orders Page (Protected)</div>
                </ProtectedRoute>
              }
            />

            {/* Admin routes - check both auth and admin role */}
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProductList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <AdminRoute>
                  <AdminProductForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <AdminProductForm />
                </AdminRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<div className="mt-5 text-center">404 Not Found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
