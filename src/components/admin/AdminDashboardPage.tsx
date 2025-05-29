import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CubeIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

import ProductService from "../../api/productService";
import OrderService from "../../api/orderService";
import AuthService from "../../api/authService";

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    positive: boolean;
  };
  linkTo: string;
}

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

  // Function to fetch data from all APIs in parallel
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsResponse, ordersResponse, usersResponse] = await Promise.all([
        ProductService.getProducts({ limit: 1 }),
        OrderService.getAdminOrders(),
        AuthService.getAllUsers(),
      ]);

      let totalRevenue = 0;
      if (ordersResponse.orders) {
        ordersResponse.orders.forEach(order => {
          if (order.totalPrice) {
            totalRevenue += order.totalPrice;
          }
        });
      }

      setStats({
        products: productsResponse.productsCount || 0,
        orders: ordersResponse.orders?.length || 0,
        users: usersResponse.count || 0,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dashboard statistics
  const dashboardStats: DashboardStat[] = [
    {
      title: "Total Products",
      value: stats.products,
      icon: <CubeIcon className="h-12 w-12 text-indigo-600" />,
      change: {
        value: "+4.2%",
        positive: true,
      },
      linkTo: "/admin/products",
    },
    {
      title: "Total Orders",
      value: stats.orders,
      icon: <ShoppingBagIcon className="h-12 w-12 text-emerald-600" />,
      change: {
        value: "+2.7%",
        positive: true,
      },
      linkTo: "/admin/orders",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: <UserGroupIcon className="h-12 w-12 text-sky-600" />,
      change: {
        value: "+12.9%",
        positive: true,
      },
      linkTo: "/admin/users",
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <ChartBarIcon className="h-12 w-12 text-amber-600" />,
      change: {
        value: "+8.1%",
        positive: true,
      },
      linkTo: "/admin/orders",
    },
  ];

  // Admin quick actions
  const quickActions = [
    {
      title: "Add New Product",
      description: "Create a new product with details, images, and inventory",
      icon: <CubeIcon className="h-6 w-6 text-indigo-600" />,
      linkTo: "/admin/products/new",
    },
    {
      title: "Manage Orders",
      description: "View and update order status and shipping information",
      icon: <ShoppingBagIcon className="h-6 w-6 text-emerald-600" />,
      linkTo: "/admin/orders",
    },
    {
      title: "Manage Users",
      description: "View, delete users and update user roles",
      icon: <UserGroupIcon className="h-6 w-6 text-sky-600" />,
      linkTo: "/admin/users",
    },
    {
      title: "View Product Inventory",
      description: "Check and update stock levels for all products",
      icon: <ChartBarIcon className="h-6 w-6 text-amber-600" />,
      linkTo: "/admin/products",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-gray-800">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading dashboard data...
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat, index) => (
                <Link
                  to={stat.linkTo}
                  key={index}
                  className="group relative overflow-hidden bg-white p-6 shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition duration-300 transform hover:scale-[1.01]"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{stat.icon}</div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">{stat.title}</dt>
                        <dd className="mt-2">
                          <div className="text-3xl font-semibold text-gray-900">{stat.value}</div>
                        </dd>
                        {stat.change && (
                          <dd className="mt-1 flex items-center text-sm">
                            {stat.change.positive ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 text-red-500" />
                            )}
                            <span
                              className={`ml-1 ${
                                stat.change.positive ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {stat.change.value} since last month
                            </span>
                          </dd>
                        )}
                      </dl>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 transform translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-3">
              {quickActions.map((action, index) => (
                <Link
                  to={action.linkTo}
                  key={index}
                  className="group flex items-start space-x-4 bg-white p-6 shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 hover:border-indigo-200"
                >
                  <div className="flex-shrink-0 bg-indigo-50 p-3 rounded-lg">{action.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                  </div>
                  <div className="hidden lg:block">
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent Activity (Placeholder) */}
            <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-5">Recent Activity</h2>
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-gray-900">Latest Orders</h3>
                  <Link
                    to="/admin/orders"
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View all
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="text-center py-8 text-gray-500">
                  {stats.orders > 0 ? (
                    <p>View all orders in the Orders section</p>
                  ) : (
                    <p>No orders found</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
