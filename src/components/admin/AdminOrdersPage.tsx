import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import OrderService from "../../api/orderService";
import type { Order } from "../../types/generated/Api";

// Define pagination info type
interface PaginationInfo {
  page: number;
  totalPages: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

// Define sort options
type SortField = "date" | "price" | "status";
type SortDirection = "asc" | "desc";

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

// Define filter options
interface FilterOptions {
  status: string | null;
  dateRange: "all" | "7days" | "30days" | "6months";
}

// Format date helper
const formatDate = (timestamp?: string) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

const AdminOrdersPage: React.FC = () => {
  // State for orders and loading
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<Set<string>>(new Set());
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<Set<string>>(new Set());
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Sort and filter state
  const [sortOption, setSortOption] = useState<SortOption>({ field: "date", direction: "desc" });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: null,
    dateRange: "all",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    limit: 10, // Number of orders per page
    hasPrevPage: false,
    hasNextPage: false,
  });

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(
    (orderList: Order[]) => {
      // First filter by status
      let result = [...orderList];

      if (filterOptions.status) {
        result = result.filter(order => order.orderStatus === filterOptions.status);
      }

      // Then filter by date range
      const now = new Date();
      if (filterOptions.dateRange !== "all") {
        let cutoffDate: Date;

        switch (filterOptions.dateRange) {
          case "7days":
            cutoffDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "30days":
            cutoffDate = new Date(now.setDate(now.getDate() - 30));
            break;
          case "6months":
            cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
            break;
          default:
            cutoffDate = new Date(0); // Beginning of time
        }

        result = result.filter(order => {
          if (!order.createdAt) return true;
          const orderDate = new Date(order.createdAt);
          return orderDate >= cutoffDate;
        });
      }

      // Sort the filtered results
      result.sort((a, b) => {
        if (sortOption.field === "date") {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return sortOption.direction === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortOption.field === "price") {
          const priceA = a.totalPrice || 0;
          const priceB = b.totalPrice || 0;
          return sortOption.direction === "asc" ? priceA - priceB : priceB - priceA;
        } else if (sortOption.field === "status") {
          const statusOrder = { Processing: 1, Shipped: 2, Delivered: 3 };
          const statusA = a.orderStatus
            ? statusOrder[a.orderStatus as keyof typeof statusOrder] || 0
            : 0;
          const statusB = b.orderStatus
            ? statusOrder[b.orderStatus as keyof typeof statusOrder] || 0
            : 0;
          return sortOption.direction === "asc" ? statusA - statusB : statusB - statusA;
        }
        return 0;
      });

      // Update filtered orders
      setFilteredOrders(result);

      // Update pagination
      const totalPages = Math.ceil(result.length / pagination.limit);
      setPagination(prev => ({
        ...prev,
        page: Math.min(prev.page, totalPages || 1),
        totalPages,
        hasPrevPage: prev.page > 1,
        hasNextPage: prev.page < totalPages,
      }));
    },
    [filterOptions, sortOption, pagination.limit]
  );

  // Fetch all orders (admin)
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await OrderService.getAdminOrders();

        if (response.success && response.orders) {
          setOrders(response.orders);

          // Apply initial filtering and sorting
          applyFiltersAndSort(response.orders);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("An error occurred while fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [applyFiltersAndSort]);

  // Update when sort or filter changes or orders change
  useEffect(() => {
    applyFiltersAndSort(orders);
  }, [orders, applyFiltersAndSort]);

  // Handle sort option change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split("-") as [SortField, SortDirection];
    setSortOption({ field, direction });
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value === "all" ? null : e.target.value;
    setFilterOptions(prev => ({ ...prev, status: status as string | null }));
  };

  // Handle date range filter change
  const handleDateRangeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions(prev => ({
      ...prev,
      dateRange: e.target.value as FilterOptions["dateRange"],
    }));
  };

  // Change page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this order? This action cannot be undone.")
    ) {
      return;
    }

    setDeleteLoading(prev => new Set(prev).add(orderId));

    try {
      const response = await OrderService.deleteOrder(orderId);

      if (response.success) {
        // Remove the order from the list
        setOrders(prevOrders => prevOrders.filter(o => o._id !== orderId));
        setUpdateSuccess("Order deleted successfully");

        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(null), 3000);
      } else {
        setError(response.message || "Failed to delete order");

        // Clear error message after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("An error occurred while deleting the order");

      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: "Processing" | "Shipped" | "Delivered"
  ) => {
    setStatusUpdateLoading(prev => new Set(prev).add(orderId));

    try {
      const response = await OrderService.updateOrderStatus(orderId, newStatus);

      if (response.success) {
        // Update the order in the list
        setOrders(prevOrders =>
          prevOrders.map(o => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        setUpdateSuccess(`Order status updated to ${newStatus}`);

        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(null), 3000);
      } else {
        setError(response.message || "Failed to update order status");

        // Clear error message after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(
        (err as { response: { data: { message: string } } }).response.data.message ||
          "An error occurred while updating order status"
      );

      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setStatusUpdateLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !updateSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display current page orders
  const startIdx = (pagination.page - 1) * pagination.limit;
  const endIdx = Math.min(startIdx + pagination.limit, filteredOrders.length);
  const currentPageOrders = filteredOrders.slice(startIdx, endIdx);

  // Show empty state
  if (filteredOrders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Manage Orders</h1>

        {/* Filters (even when empty) */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Filter Orders</h3>
              <p className="mt-1 text-sm text-gray-500">
                Customize your orders view with these filters.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                    Sort by
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={`${sortOption.field}-${sortOption.direction}`}
                    onChange={handleSortChange}
                  >
                    <option value="date-desc">Date (newest first)</option>
                    <option value="date-asc">Date (oldest first)</option>
                    <option value="price-desc">Price (high to low)</option>
                    <option value="price-asc">Price (low to high)</option>
                    <option value="status-desc">Status (delivered first)</option>
                    <option value="status-asc">Status (processing first)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Order status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filterOptions.status || "all"}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                    Time period
                  </label>
                  <select
                    id="dateRange"
                    name="dateRange"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filterOptions.dateRange}
                    onChange={handleDateRangeFilterChange}
                  >
                    <option value="all">All time</option>
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="6months">Last 6 months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-16">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10L4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length > 0
              ? "No orders match your selected filters. Try changing your filter options."
              : "There are no orders in the system yet."}
          </p>
          {filterOptions.status || filterOptions.dateRange !== "all" ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setFilterOptions({ status: null, dateRange: "all" })}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Manage Orders</h1>

      {/* Success message */}
      {updateSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{updateSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message that appears with other content */}
      {error && updateSuccess && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Filter Orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              Customize your orders view with these filters.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                  Sort by
                </label>
                <select
                  id="sort"
                  name="sort"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={`${sortOption.field}-${sortOption.direction}`}
                  onChange={handleSortChange}
                >
                  <option value="date-desc">Date (newest first)</option>
                  <option value="date-asc">Date (oldest first)</option>
                  <option value="price-desc">Price (high to low)</option>
                  <option value="price-asc">Price (low to high)</option>
                  <option value="status-desc">Status (delivered first)</option>
                  <option value="status-asc">Status (processing first)</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Order status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterOptions.status || "all"}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                  Time period
                </label>
                <select
                  id="dateRange"
                  name="dateRange"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterOptions.dateRange}
                  onChange={handleDateRangeFilterChange}
                >
                  <option value="all">All time</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="6months">Last 6 months</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order count summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredOrders.length}</span> of{" "}
          <span className="font-medium">{orders.length}</span> total orders
        </p>
        {filterOptions.status || filterOptions.dateRange !== "all" ? (
          <button
            type="button"
            onClick={() => setFilterOptions({ status: null, dateRange: "all" })}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageOrders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-indigo-600">
                    <Link to={`/admin/orders/${order._id}`}>
                      #{order._id?.substring(order._id.length - 8)}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.user?.name || "N/A"}</div>
                  <div className="text-sm text-gray-500">{order.user?.email || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${order.totalPrice?.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    {order.orderItems?.length || 0} item(s)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.orderStatus}
                    onChange={e =>
                      handleUpdateOrderStatus(
                        order._id!,
                        e.target.value as "Processing" | "Shipped" | "Delivered"
                      )
                    }
                    disabled={statusUpdateLoading.has(order._id!)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteOrder(order._id!)}
                      disabled={deleteLoading.has(order._id!)}
                      className={`text-red-600 hover:text-red-900 ${
                        deleteLoading.has(order._id!) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {deleteLoading.has(order._id!) ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 border rounded-md shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.hasPrevPage
                  ? "bg-white text-gray-700 hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.hasNextPage
                  ? "bg-white text-gray-700 hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIdx + 1}</span> to{" "}
                <span className="font-medium">{endIdx}</span> of{" "}
                <span className="font-medium">{filteredOrders.length}</span> orders
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    pagination.hasPrevPage
                      ? "bg-white text-gray-500 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Calculate page numbers to show (always show active page in the middle when possible)
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    // If we have 5 or fewer pages, just show all of them
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    // If we're near the beginning, show pages 1-5
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    // If we're near the end, show the last 5 pages
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    // Otherwise center the current page
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === pageNum
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    pagination.hasNextPage
                      ? "bg-white text-gray-500 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
