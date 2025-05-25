import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductService, { type Product, type ProductFilters } from "../../api/productService";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);

  // Filter states
  const [filters, setFilters] = useState<ProductFilters>({
    keyword: "",
    category: "",
    page: 1,
    limit: 10,
  }); // Search input state separate from filters
  const [searchInput, setSearchInput] = useState<string>("");

  // Categories (in a real app, these might come from an API)
  const categories = [
    "Electronics",
    "Cameras",
    "Laptops",
    "Accessories",
    "Headphones",
    "Food",
    "Books",
    "Clothes",
    "Shoes",
    "Beauty",
    "Sports",
    "Outdoor",
    "Home",
  ];

  // No longer need search timeout cleanup

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProducts({
          ...filters,
          page: currentPage,
        });
        setProducts(response.products);
        setProductsCount(response.productsCount);

        // Calculate total pagesElectronics
        const perPage = response.resultPerPage || filters.limit || 10;
        setResultsPerPage(perPage);
        setTotalPages(Math.ceil(response.productsCount / perPage));

        setLoading(false);
      } catch {
        setError("Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filters]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Set product as deleting
        setDeletingProducts(prev => new Set(prev).add(id));

        await ProductService.deleteProduct(id);
        // Update the products list after deletion
        setProducts(products.filter(product => product._id !== id));

        // Refresh the product list if we delete the last item on a page
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Reload the current page to update counts
          const response = await ProductService.getProducts({
            ...filters,
            page: currentPage,
          });
          setProducts(response.products);
          setProductsCount(response.productsCount);
          setTotalPages(
            Math.ceil(response.productsCount / (response.resultPerPage || filters.limit || 10))
          );
        }
      } catch {
        setError("Failed to delete product");
      } finally {
        // Remove product from the deleting set
        setDeletingProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }; // Handle search input change without triggering search
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    // No longer using debounce - will only search on form submit or search button click
  };

  // Apply search
  const applySearch = () => {
    setFilters(prev => ({
      ...prev,
      keyword: searchInput,
    }));
    setCurrentPage(1);
  };

  // Cleaner handler for non-search filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Skip debounce for non-search filters
    if (name !== "keyword") {
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
      // Reset to first page when filters change
      setCurrentPage(1);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applySearch();
  };

  // Access control is now handled by RouteGuard

  // Loading state is now handled within the table area

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 font-semibold">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add New Product
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative flex">
            <input
              type="text"
              name="keyword"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search products..."
              className="w-full p-2 appearance-none rounded-l bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 pl-10"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={applySearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              aria-label="Search"
            >
              Search
            </button>
          </div>

          <div className="relative">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full p-2 pr-8 appearance-none rounded bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category.toLocaleLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 text-gray-500"
            />
          </div>

          <div className="relative">
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="w-full p-2 pr-8 appearance-none rounded bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 text-gray-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-offset-2 focus:outline-2 focus:outline-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex justify-center items-center">
            <div
              role="status"
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product._id?.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded-md mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-md mr-3"></div>
                    )}
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.Stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => product._id && handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete product"
                      disabled={product._id ? deletingProducts.has(product._id) : false}
                    >
                      {product._id && deletingProducts.has(product._id) ? (
                        <svg
                          className="animate-spin h-5 w-5 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4zm16 0a8 8 0 01-8 8v-4a4 4 0 004-4h4z"
                          />
                        </svg>
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center p-8">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
      {/* </div> */}

      {/* Pagination - Modern design at bottom of page */}
      {totalPages > 1 && (
        <div className="mt-8 mb-4">
          {/* Info display */}
          <div className="text-sm text-gray-500 mb-3 text-center">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {(currentPage - 1) * resultsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-700">
              {Math.min(currentPage * resultsPerPage, productsCount)}
            </span>{" "}
            of <span className="font-medium text-gray-700">{productsCount}</span> products
          </div>

          {/* Pagination controls */}
          <div className="flex justify-center">
            <nav className="flex items-center rounded-lg overflow-hidden shadow">
              {/* First page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 ${
                  currentPage === 1
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                } border-r border-gray-200 transition-colors duration-150`}
                aria-label="First page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 ${
                  currentPage === 1
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                } border-r border-gray-200 transition-colors duration-150`}
                aria-label="Previous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                const pageNumber = startPage + i;

                if (pageNumber <= endPage) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`flex items-center justify-center w-10 h-10 ${
                        pageNumber === currentPage
                          ? "bg-blue-500 text-white font-semibold"
                          : "bg-white text-gray-700 hover:bg-blue-50"
                      } border-r border-gray-200 transition-colors duration-150`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 ${
                  currentPage === totalPages
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                } border-r border-gray-200 transition-colors duration-150`}
                aria-label="Next page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Last page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 ${
                  currentPage === totalPages
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                } transition-colors duration-150`}
                aria-label="Last page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M10.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductList;
