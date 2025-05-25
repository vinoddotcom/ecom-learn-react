import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import AddToCartButton from "../cart/AddToCartButton";
import type { Product } from "../../api/productService";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true }) => {
  // Helper function to render rating stars
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index}>
        {index < Math.floor(rating) ? (
          <StarIconSolid className="h-4 w-4 text-yellow-400" aria-hidden="true" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" aria-hidden="true" />
        )}
      </span>
    ));
  };

  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0]?.url || "https://via.placeholder.com/300"}
            alt={product.name}
            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
          />
        </Link>
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link to={`/products/${product._id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <div className="mt-1 flex items-center">
            {renderRatingStars(product.rating || 0)}
            <span className="ml-1 text-xs text-gray-500">({product.numOfReviews || 0})</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
          {showAddToCart && (
            <div className="mt-2">
              <AddToCartButton
                productId={product._id!}
                name={product.name}
                price={product.price}
                image={product.images?.[0]?.url || "https://via.placeholder.com/300"}
                stock={product.Stock || 0}
                size="sm"
                showText={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
