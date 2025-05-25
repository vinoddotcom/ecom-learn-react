import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./components/auth/signIn";
import SignUp from "./components/auth/signUp";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import AdminProductList from "./components/admin/AdminProductList";
import AdminProductForm from "./components/admin/AdminProductForm";
import { getUserProfile } from "./store/slices/authSlice";
import { useAppDispatch } from "./store/hooks";
import RouteGuard from "./routes/RouteGuard";
import { RouteType, RoutePath } from "./routes/routeConfig";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This will make sure the auth state is initialized
    // This is important for the first load, but route-specific checks will be handled by RouteGuard
    dispatch(getUserProfile());
  }, [dispatch]); // Only runs once on mount

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main className="min-h-screen">
          <Routes>
            {/* Public routes - load immediately without waiting for auth */}
            <Route
              path={RoutePath.HOME}
              element={
                <RouteGuard routeType={RouteType.PUBLIC}>
                  <div className="mt-5 text-center">Home Page</div>
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.SIGNIN}
              element={
                <RouteGuard routeType={RouteType.PUBLIC}>
                  <SignIn />
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.SIGNUP}
              element={
                <RouteGuard routeType={RouteType.PUBLIC}>
                  <SignUp />
                </RouteGuard>
              }
            />

            {/* Protected routes - check auth status before rendering */}
            <Route
              path={RoutePath.PROFILE}
              element={
                <RouteGuard routeType={RouteType.PROTECTED}>
                  <div className="mt-5 text-center">Profile Page (Protected)</div>
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.ORDERS}
              element={
                <RouteGuard routeType={RouteType.PROTECTED}>
                  <div className="mt-5 text-center">Orders Page (Protected)</div>
                </RouteGuard>
              }
            />

            {/* Admin routes - check both auth and admin role */}
            <Route
              path={RoutePath.ADMIN_PRODUCTS}
              element={
                <RouteGuard routeType={RouteType.ADMIN}>
                  <AdminProductList />
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.ADMIN_PRODUCTS_NEW}
              element={
                <RouteGuard routeType={RouteType.ADMIN}>
                  <AdminProductForm />
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.ADMIN_PRODUCTS_EDIT}
              element={
                <RouteGuard routeType={RouteType.ADMIN}>
                  <AdminProductForm />
                </RouteGuard>
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
