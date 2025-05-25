import React, { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addToCart } from "../../store/slices/cartSlice";
import { ShoppingCartIcon, CheckIcon } from "@heroicons/react/24/outline";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  name,
  price,
  image,
  stock,
  quantity = 1,
  size = "md",
  className = "",
  showText = true,
}) => {
  const dispatch = useAppDispatch();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);

    // Add the product to the cart
    dispatch(
      addToCart({
        productId,
        name,
        price,
        image,
        stock,
        quantity,
      })
    );

    // Show success state
    setIsAdded(true);

    // Reset after 1.5 seconds
    setTimeout(() => {
      setIsAdded(false);
      setIsLoading(false);
    }, 1500);
  };

  // Determine button size
  const sizeClasses = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm",
    lg: "p-3 text-base",
  };

  // Determine icon size
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Base button classes
  const baseClasses = `rounded-md flex items-center justify-center transition-colors ${sizeClasses[size]}`;

  // Combine with state-based classes
  const buttonClasses = `
    ${baseClasses}
    ${
      isAdded
        ? "bg-green-50 text-green-600 border border-green-500"
        : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    }
    ${stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleAddToCart}
      disabled={isLoading || stock <= 0}
    >
      {isAdded ? (
        <>
          <CheckIcon className={iconSizes[size]} aria-hidden="true" />
          {showText && <span className="ml-2">Added</span>}
        </>
      ) : (
        <>
          <ShoppingCartIcon className={iconSizes[size]} aria-hidden="true" />
          {showText && <span className="ml-2">Add to Cart</span>}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
