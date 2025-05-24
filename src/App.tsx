import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./components/auth/signIn";
import SignUp from "./components/auth/signUp";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import AdminProductList from "./components/admin/AdminProductList";
import AdminRoute from "./components/routes/AdminRoute";
import { getUserProfile } from "./store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore authentication on page refresh by checking for existing session
    dispatch(getUserProfile());
  }, [dispatch]); // Only runs once on mount

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main className="min-h-screen">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<div className="mt-5 text-center">Home Page</div>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected routes */}
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

            {/* Admin routes */}
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProductList />
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
