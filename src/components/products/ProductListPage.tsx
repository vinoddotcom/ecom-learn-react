import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductService, { type Product, type ProductFilters } from "../../api/productService";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import ProductCard from "./ProductCard";

// Available categories
const AVAILABLE_CATEGORIES = ["Electronics", "Cameras", "Laptops", "Accessories"];

// Category banners and descriptions
const CATEGORY_INFO = {
  electronics: {
    title: "Electronics",
    description: "Discover the latest electronics for your home and office.",
    banner:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3270&q=80",
  },
  cameras: {
    title: "Cameras",
    description: "Capture your memories with our high-quality cameras.",
    banner:
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3270&q=80",
  },
  laptops: {
    title: "Laptops",
    description: "Find the perfect laptop for work, gaming, or everyday use.",
    banner:
      "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3274&q=80",
  },
  accessories: {
    title: "Accessories",
    description: "Complement your tech with our wide range of accessories.",
    banner:
      "https://images.unsplash.com/photo-1625961332771-3be6d2cbc49c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3270&q=80",
  },
  default: {
    title: "All Products",
    description: "Explore our complete collection of tech products.",
    banner:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3271&q=80",
  },
};

// Price ranges for filtering
const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200 - $500", min: 200, max: 500 },
  { label: "$500+", min: 500, max: undefined },
];

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [resultsPerPage, setResultsPerPage] = useState<number>(12);

  // Get filters from URL parameters
  const category = searchParams.get("category")?.toLowerCase() || "";
  const keyword = searchParams.get("keyword") || "";
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 12;

  // Filter states
  const [searchInput, setSearchInput] = useState<string>(keyword);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(
    PRICE_RANGES.findIndex(range => range.min === minPrice && range.max === maxPrice) !== -1
      ? PRICE_RANGES.findIndex(range => range.min === minPrice && range.max === maxPrice)
      : 0
  );

  // Mobile filter visibility state
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Set current page from URL
  useEffect(() => {
    if (page) {
      setCurrentPage(page);
    }
    if (limit) {
      setResultsPerPage(limit);
    }
  }, [page, limit]);

  // Update URL when filters change
  const updateSearchParams = (
    newCategory?: string,
    newKeyword?: string,
    newPage?: number,
    newPriceMin?: number,
    newPriceMax?: number
  ) => {
    const params = new URLSearchParams(searchParams);

    if (newCategory !== undefined) {
      if (newCategory) {
        params.set("category", newCategory);
      } else {
        params.delete("category");
      }
    }

    if (newKeyword !== undefined) {
      if (newKeyword) {
        params.set("keyword", newKeyword);
      } else {
        params.delete("keyword");
      }
    }

    if (newPage !== undefined) {
      if (newPage > 1) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }
    }

    if (newPriceMin !== undefined) {
      if (newPriceMin > 0) {
        params.set("minPrice", newPriceMin.toString());
      } else {
        params.delete("minPrice");
      }
    }

    if (newPriceMax !== undefined) {
      if (newPriceMax) {
        params.set("maxPrice", newPriceMax.toString());
      } else {
        params.delete("maxPrice");
      }
    }

    setSearchParams(params);
  };

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const filters: ProductFilters = {
          page: currentPage,
          limit: resultsPerPage,
        };

        if (category) {
          filters.category = category;
        }

        if (keyword) {
          filters.keyword = keyword;
        }

        if (minPrice !== undefined) {
          filters.price = {
            gte: minPrice,
            ...(filters.price || {}),
          };
        }

        if (maxPrice !== undefined) {
          filters.price = {
            lte: maxPrice,
            ...(filters.price || {}),
          };
        }

        const response = await ProductService.getProducts(filters);

        setProducts(response.products);
        setProductsCount(response.productsCount);

        // Calculate total pages
        const perPage = response.resultPerPage || filters.limit || 12;
        setResultsPerPage(perPage);
        setTotalPages(Math.ceil(response.productsCount / perPage));

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, keyword, currentPage, minPrice, maxPrice, resultsPerPage]);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams(undefined, searchInput, 1);
  };

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    updateSearchParams(newCategory, undefined, 1);
  };

  // Handle price range change
  const handlePriceRangeChange = (index: number) => {
    setSelectedPriceRange(index);
    const range = PRICE_RANGES[index];
    updateSearchParams(undefined, undefined, 1, range.min, range.max);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    updateSearchParams(undefined, undefined, page);
  };

  // Get category info for hero section
  const getCategoryInfo = () => {
    if (category && CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]) {
      return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
    }
    return CATEGORY_INFO.default;
  };

  const categoryInfo = getCategoryInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section based on selected category */}
      <div className="relative h-[450px] z-[0]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${categoryInfo.banner})` }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-6 relative h-full flex items-center z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold text-white mb-4">{categoryInfo.title}</h1>
            <p className="text-lg text-gray-200 mb-6">{categoryInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full p-3 pl-10 pr-12 appearance-none rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1 rounded-md hover:bg-blue-700"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Mobile Filter Toggle */}
            <button
              className="md:hidden flex items-center justify-center bg-gray-100 p-3 rounded-md"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 mr-2" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden md:flex gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none rounded-md bg-white p-3 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                >
                  <option value="">All Categories</option>
                  {AVAILABLE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-500"
                />
              </div>

              {/* Price Filter */}
              <div className="relative">
                <select
                  value={selectedPriceRange}
                  onChange={e => handlePriceRangeChange(Number(e.target.value))}
                  className="w-full appearance-none rounded-md bg-white p-3 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                >
                  {PRICE_RANGES.map((range, index) => (
                    <option key={range.label} value={index}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Mobile Filters (collapsible) */}
          {showMobileFilters && (
            <div className="mt-4 md:hidden grid grid-cols-1 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full appearance-none rounded-md bg-white p-3 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                  >
                    <option value="">All Categories</option>
                    {AVAILABLE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-500"
                  />
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="relative">
                  <select
                    value={selectedPriceRange}
                    onChange={e => handlePriceRangeChange(Number(e.target.value))}
                    className="w-full appearance-none rounded-md bg-white p-3 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                  >
                    {PRICE_RANGES.map((range, index) => (
                      <option key={range.label} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Count and Sort */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {loading
              ? "Loading products..."
              : `Showing ${products.length} of ${productsCount} products`}
          </p>
          <div className="relative">
            <select
              className="appearance-none rounded-md bg-white p-2 pr-8 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
              onChange={e => setResultsPerPage(Number(e.target.value))}
              value={resultsPerPage}
            >
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
              <option value="48">48 per page</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-gray-500"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="text-red-500 font-semibold">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          // </div>
          <div className="text-center p-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  setSearchInput("");
                  setSelectedCategory("");
                  setSelectedPriceRange(0);
                }}
                className="text-blue-600 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
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
    </div>
  );
};

export default ProductListPage;
