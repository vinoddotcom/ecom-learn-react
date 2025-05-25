import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductService, { type Product } from "../../api/productService";
import { ArrowRightIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

// Featured categories (the ones currently available)
const AVAILABLE_CATEGORIES = ["Electronics", "Cameras", "Laptops", "Accessories"];

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [heroCategory, setHeroCategory] = useState<string>("Electronics");

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        // Create an object to store products by category
        const productsByCategory: Record<string, Product[]> = {};

        // Fetch products for each available category
        const promises = AVAILABLE_CATEGORIES.map(async category => {
          const response = await ProductService.getProducts({
            category: category.toLowerCase(),
            limit: 4, // Limit to 4 products per category
          });
          productsByCategory[category] = response.products;
        });

        await Promise.all(promises);
        setFeaturedProducts(productsByCategory);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchCategoryProducts();

    // Set a random hero category from available categories
    setHeroCategory(AVAILABLE_CATEGORIES[Math.floor(Math.random() * AVAILABLE_CATEGORIES.length)]);
  }, []);

  // Find a hero product from the hero category
  const heroProduct = featuredProducts[heroCategory]?.[0];

  return (
    <div className="min-h-screen bg-gray-50 z-[0]">
      {/* Hero Section */}
      {loading ? (
        <div className="w-full h-96 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="w-full h-96 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-red-500 text-xl">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : heroProduct ? (
        <div className="relative h-[500px]">
          {/* Professional Hero Section with a clean, simple design */}
          <div className="absolute inset-0 bg-gray-100"></div>

          {/* Hero Content */}
          <div className="container mx-auto px-6 relative h-full flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  New Arrivals in <span className="text-blue-600">{heroCategory}</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Discover the latest and greatest products in our {heroCategory.toLowerCase()}{" "}
                  collection, designed to meet your technology needs.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={`/products/${heroProduct._id}`}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to="/products"
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Browse All
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  {/* Blue circle background */}
                  <div className="absolute inset-0 bg-blue-100 rounded-full transform scale-90"></div>

                  {/* Product image */}
                  <img
                    src={heroProduct.images?.[0]?.url}
                    alt={heroProduct.name}
                    className="relative w-full h-96 object-contain p-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Featured Categories */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AVAILABLE_CATEGORIES.map(category => (
              <Link
                key={category}
                to={`/products?category=${category.toLowerCase()}`}
                className="group"
              >
                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-64 relative">
                  {/* Use the first product image from the category as the category image */}
                  {featuredProducts[category]?.[0]?.images?.[0]?.url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundImage: `url(${featuredProducts[category][0].images[0].url})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gray-200"></div>
                  )}

                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-xl font-semibold text-white">{category}</h3>
                    <p className="text-sm text-gray-200 mt-1">
                      {featuredProducts[category]?.length || 0} products
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Sections - One per category */}
      {AVAILABLE_CATEGORIES.map(category => (
        <div
          key={category}
          className={`py-16 ${
            AVAILABLE_CATEGORIES.indexOf(category) % 2 === 0 ? "bg-gray-50" : "bg-white"
          }`}
        >
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">{category}</h2>
              <Link
                to={`/products?category=${category.toLowerCase()}`}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                View all <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
              </div>
            ) : featuredProducts[category]?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts[category].map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link to={`/products/${product._id}`} className="block h-48 overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-contain hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                      )}
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product._id}`} className="block">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {product.description?.substring(0, 60)}...
                        </p>
                        <p className="text-xl font-semibold text-gray-900 mt-2">
                          ${product.price?.toFixed(2)}
                        </p>
                      </Link>
                      <div className="mt-4 flex">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center">
                          <ShoppingCartIcon className="h-5 w-5 mr-1" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">No products available in this category</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Newsletter Signup - Professional, Simple Design */}
      <div className="py-16 bg-blue-600">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-white/90 mb-8">
              Subscribe to our newsletter to get updates on new products, promotions, and more.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-md border border-transparent bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-sm text-white/80">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">
                All our products are carefully selected to ensure the highest quality.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">We deliver your orders within 2-3 business days.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">
                Your payments are secure with our trusted payment gateway.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
