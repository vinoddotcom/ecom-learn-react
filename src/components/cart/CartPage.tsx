import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
} from "../../store/slices/cartSlice";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handler for updating quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ productId, quantity }));
  };

  // Handler for removing item from cart
  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  // Handler for clearing cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to remove all items from your cart?")) {
      dispatch(clearCart());
    }
  };

  // Handler for proceeding to checkout
  const handleProceedToCheckout = () => {
    setIsProcessing(true);
    // Simple timeout to simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/checkout");
    }, 500);
  };

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <div className="mt-12 flex flex-col items-center justify-center space-y-6">
            <ShoppingCartIcon className="h-24 w-24 text-gray-300" aria-hidden="true" />
            <h2 className="text-xl font-medium text-gray-900">Your cart is empty</h2>
            <p className="text-gray-500">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          {/* Cart items */}
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {cartItems.map(item => (
                <li key={item.productId} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link
                              to={`/products/${item.productId}`}
                              className="font-medium text-gray-700 hover:text-gray-800"
                            >
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="mt-1 flex text-sm">
                          <p className="text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="absolute right-0 top-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center border-gray-100">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="cursor-pointer rounded-l bg-gray-100 py-1 px-3.5 duration-100 hover:bg-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </button>
                          <input
                            className="h-8 w-12 border bg-white text-center text-xs outline-none"
                            type="number"
                            value={item.quantity}
                            min="1"
                            max={item.stock}
                            onChange={e =>
                              handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="cursor-pointer rounded-r bg-gray-100 py-1 px-3 duration-100 hover:bg-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-700">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleClearCart}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Clear Shopping Cart
              </button>
            </div>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">${cartTotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex items-center text-sm text-gray-600">
                  <span>Shipping estimate</span>
                </dt>
                <dd className="text-sm font-medium text-gray-900">$5.00</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">
                  ${(cartTotal + 5).toFixed(2)}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isProcessing}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-75 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>or</p>
              <Link to="/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                Continue Shopping
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
