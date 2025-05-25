import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./components/auth/signIn";
import SignUp from "./components/auth/signUp";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import HomePage from "./components/home/HomePage";
import ProductListPage from "./components/products/ProductListPage";
import ProductDetailPage from "./components/products/ProductDetailPage";
import CartPage from "./components/cart/CartPage";
import CheckoutPage from "./components/cart/CheckoutPage";
import OrdersPage from "./components/orders/OrdersPage";
import OrderDetailPage from "./components/orders/OrderDetailPage";
import AdminProductList from "./components/admin/AdminProductList";
import AdminProductForm from "./components/admin/AdminProductForm";
import AdminOrdersPage from "./components/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./components/admin/AdminOrderDetailPage";
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
                  <HomePage />
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
                  <OrdersPage />
                </RouteGuard>
              }
            />
            <Route
              path={`${RoutePath.ORDERS}/:id`}
              element={
                <RouteGuard routeType={RouteType.PROTECTED}>
                  <OrderDetailPage />
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.PRODUCTS}
              element={
                <RouteGuard routeType={RouteType.PUBLIC}>
                  <ProductListPage />
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.PRODUCT_DETAIL}
              element={
                <RouteGuard routeType={RouteType.PUBLIC}>
                  <ProductDetailPage />
                </RouteGuard>
              }
            />

            <Route
              path={RoutePath.CART}
              element={
                <RouteGuard routeType={RouteType.PUBLIC}>
                  <CartPage />
                </RouteGuard>
              }
            />

            <Route
              path={RoutePath.CHECKOUT}
              element={
                <RouteGuard routeType={RouteType.PROTECTED}>
                  <CheckoutPage />
                </RouteGuard>
              }
            />

            {/* Admin routes - check both auth and admin role */}
            <Route
              path={RoutePath.ADMIN_PRODUCTS}
              element={
                <RouteGuard routeType={RouteType.PUBLIC}>
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
            <Route
              path={RoutePath.ADMIN_ORDERS}
              element={
                <RouteGuard routeType={RouteType.ADMIN}>
                  <AdminOrdersPage />
                </RouteGuard>
              }
            />
            <Route
              path={RoutePath.ADMIN_ORDER_DETAIL}
              element={
                <RouteGuard routeType={RouteType.ADMIN}>
                  <AdminOrderDetailPage />
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
