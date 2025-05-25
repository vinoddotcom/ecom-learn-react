import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
//   ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import ProductService from "../../api/productService";
import type { Review as ApiReview } from "../../api/productService";
// import { useDispatch } from "react-redux";
// We'll need to create cart actions later
// import { addToCart } from "../../store/slices/cartSlice";

// Extended interfaces for our needs
interface Review extends ApiReview {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  user?: string;
  createdAt?: string;
}

interface ProductImage {
  _id?: string;
  url: string;
  public_id: string;
}

// Product interface for our needs
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  ratings: number;
  images: ProductImage[];
  category: string;
  seller: string;
  stock: number;
  Stock: number;
  numOfReviews: number;
  reviews: Review[];
  user: string;
  createdAt: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Keeping dispatch for future cart implementation
//   const dispatch = useDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [showReviews, setShowReviews] = useState<boolean>(true);
  const [showDescription, setShowDescription] = useState<boolean>(true);

  // New review state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const data = await ProductService.getProductDetails(id);
        if (data.product) {
          // Create a complete product object with all required fields
          const productData = data.product;

          const processedProduct: Product = {
            _id: productData._id || id,
            name: productData.name || "Unknown Product",
            description: productData.description || "No description available",
            price: productData.price || 0,
            rating: productData.rating || 0,
            ratings: productData.rating || 0, // Use rating field from API if ratings doesn't exist
            images: productData.images || [],
            category: productData.category || "Uncategorized",
            seller: "Unknown Seller", // Default values for fields that might be missing in API
            stock: productData.Stock || 0,
            Stock: productData.Stock || 0,
            numOfReviews: productData.numOfReviews || 0,
            reviews: Array.isArray(productData.reviews)
              ? productData.reviews.map(review => ({
                  _id: (review as { _id: string })._id || Date.now().toString(),
                  name: review.name,
                  rating: review.rating,
                  comment: review.comment,
                  user: review.user || "unknown",
                  createdAt: review.createdAt || new Date().toISOString(),
                }))
              : [],
            user: "unknown", // Default user ID
            createdAt: productData.createdAt || new Date().toISOString(),
          };
          setProduct(processedProduct);
        } else {
          setError("Product not found");
        }
        setLoading(false);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to fetch product details:", errorMessage);
        setError("Failed to load product details. Please try again later.");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity < 1 || (product && newQuantity > product.stock)) return;
    setQuantity(newQuantity);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    // We'll implement this when we create the cart functionality
    // dispatch(addToCart({
    //   product: product._id,
    //   name: product.name,
    //   price: product.price,
    //   image: product.images[0]?.url,
    //   stock: product.stock,
    //   quantity
    // }));

    // For now, just log the action and show an alert
    console.log("Added to cart:", product.name, "Quantity:", quantity);

    // Simple feedback for now - in a real app, use a toast notification
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  // Handle submit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      setSubmittingReview(true);

      // Use the actual API call as defined in the Swagger API spec
      await ProductService.submitReview(id, { rating, comment });

      // Create a new review object to update the UI immediately
      const newReview: Review = {
        _id: Date.now().toString(),
        name: "Current User", // Replace with actual user name when authentication is implemented
        rating,
        comment,
        user: "user_id", // Replace with actual user ID when authentication is implemented
        createdAt: new Date().toISOString(),
      };

      if (product) {
        // Update the product state with the new review
        setProduct({
          ...product,
          reviews: [newReview, ...product.reviews],
          numOfReviews: product.numOfReviews + 1,
          ratings: (product.ratings * product.numOfReviews + rating) / (product.numOfReviews + 1),
        });
      }

      // Reset the form
      setRating(5);
      setComment("");
      setSubmittingReview(false);

      // Show success message
      alert("Review submitted successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to submit review:", errorMessage);
      setSubmittingReview(false);

      // Show error message
      alert("Failed to submit review. Please try again.");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {error || "Product not found"}
          </h2>
          <p className="mt-2 text-gray-600">We couldn't find the product you're looking for.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Helper function to render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => {
      if (index < Math.floor(rating)) {
        return <StarIconSolid key={index} className="h-5 w-5 text-yellow-400" />;
      } else if (index < Math.ceil(rating) && index > Math.floor(rating) - 1) {
        // For half stars, we could use a different icon or approach
        // For simplicity, we'll just use the solid icon for anything above 0
        return <StarIconSolid key={index} className="h-5 w-5 text-yellow-400 opacity-50" />;
      }
      return <StarIcon key={index} className="h-5 w-5 text-gray-300" />;
    });
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Details Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-6">
              <div className="sticky top-8">
                {/* Main Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[activeImage]?.url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image: ProductImage, index: number) => (
                      <div
                        key={image._id || `img-${index}`}
                        className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                          index === activeImage ? "border-blue-500" : "border-transparent"
                        }`}
                        onClick={() => setActiveImage(index)}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} - view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6">
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center mb-4">
                  <div className="flex">{renderStars(product.ratings)}</div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.numOfReviews} {product.numOfReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                <div className="mt-1 flex items-center">
                  {product.stock > 0 ? (
                    <>
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <p className="text-sm text-gray-600">
                        {product.stock > 10
                          ? "In stock"
                          : `Only ${product.stock} left in stock - order soon`}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <p className="text-sm text-gray-600">Out of stock</p>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center mb-2">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">30-day hassle-free returns</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">1-year warranty included</span>
                </div>
              </div>

              {/* Quantity Picker */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-l-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    id="quantity"
                    value={quantity}
                    readOnly
                    className="appearance-none w-16 text-center p-2 border-y border-gray-300 text-gray-900 outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.stock <= quantity}
                    className="p-2 border border-gray-300 rounded-r-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mb-6 flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
                <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <HeartIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Category and Seller Info */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Category:</span> {product.category}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Seller:</span> {product.seller}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description and Reviews */}
        <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Description Section */}
          <div className="border-b border-gray-200">
            <button
              className="w-full p-4 text-left flex justify-between items-center focus:outline-none"
              onClick={() => setShowDescription(!showDescription)}
            >
              <h2 className="text-xl font-semibold text-gray-900">Product Description</h2>
              <ChevronDownIcon
                className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${
                  showDescription ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDescription && (
              <div className="p-4 pt-0 prose max-w-none">
                {product.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}

                {/* Product specifications section could be added here */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Category:</span>
                      <span className="text-gray-600">{product.category}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Brand:</span>
                      <span className="text-gray-600">{product.seller}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Stock:</span>
                      <span className="text-gray-600">{product.stock} units</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div>
            <button
              className="w-full p-4 text-left flex justify-between items-center focus:outline-none"
              onClick={() => setShowReviews(!showReviews)}
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Customer Reviews ({product.numOfReviews})
              </h2>
              <ChevronDownIcon
                className={`h-6 w-6 text-gray-500 transform transition-transform duration-200 ${
                  showReviews ? "rotate-180" : ""
                }`}
              />
            </button>

            {showReviews && (
              <div className="p-4 pt-0">
                {/* Average Rating Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="md:flex">
                    <div className="md:w-1/3 text-center mb-4 md:mb-0">
                      <div className="text-5xl font-bold text-gray-900">
                        {product.ratings.toFixed(1)}
                      </div>
                      <div className="flex justify-center mt-2">{renderStars(product.ratings)}</div>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.numOfReviews} {product.numOfReviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>

                    <div className="md:w-2/3 md:pl-6">
                      {[5, 4, 3, 2, 1].map(star => {
                        const reviewsWithRating = product.reviews.filter(
                          (review: Review) => Math.round(review.rating) === star
                        ).length;
                        const percentage =
                          product.numOfReviews > 0
                            ? (reviewsWithRating / product.numOfReviews) * 100
                            : 0;

                        return (
                          <div key={star} className="flex items-center mb-2">
                            <div className="w-12 text-right text-sm text-gray-600">
                              {star} stars
                            </div>
                            <div className="w-full ml-4 mr-4">
                              <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-yellow-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-12 text-sm text-gray-600">{reviewsWithRating}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            {star <= rating ? (
                              <StarIconSolid className="h-6 w-6 text-yellow-400" />
                            ) : (
                              <StarIcon className="h-6 w-6 text-gray-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Review
                      </label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={4}
                        className="w-full p-3 rounded-md appearance-none bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                        placeholder="Share your experience with this product..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      {submittingReview ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review: Review) => (
                      <div
                        key={review._id || `review-${review.name}`}
                        className="border-b border-gray-200 pb-6 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{review.name}</h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        <div className="flex mb-2">{renderStars(review.rating)}</div>

                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No reviews yet. Be the first to review this product!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products placeholder - Could be implemented later */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would be populated from an API call for related products */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Related product</span>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Related product</span>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Related product</span>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Related product</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
