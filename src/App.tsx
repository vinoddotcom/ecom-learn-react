import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./components/auth/signIn";
import SignUp from "./components/auth/signUp";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import { getUserProfile } from "./store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

// Protected Route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);

  useEffect(() => {
    // If we have a token, try to get the user profile when the app loads
    if (token) {
      dispatch(getUserProfile());
    }
  }, [dispatch, token]);

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
