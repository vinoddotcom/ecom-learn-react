import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCart, selectCartItems, selectCartTotal } from "../../store/slices/cartSlice";
import OrderService, { type CreateOrderRequest } from "../../api/orderService";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const paymentMethods = [
  { id: "credit-card", title: "Credit card" },
  { id: "paypal", title: "PayPal" },
  { id: "cash", title: "Cash on delivery" },
];

const deliveryMethods = [
  {
    id: "standard",
    title: "Standard",
    turnaround: "4–10 business days",
    price: "5.00",
  },
  {
    id: "express",
    title: "Express",
    turnaround: "2-5 business days",
    price: "16.00",
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(deliveryMethods[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
    cardNumber: "",
    cardName: "",
    cardExpiration: "",
    cardCvc: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field if there was one
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "region",
      "postalCode",
      "country",
      "phone",
      "email",
    ];

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        errors[field] = "This field is required";
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // If credit card is selected, validate card fields
    if (selectedPaymentMethod.id === "credit-card") {
      // Card number validation
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        errors.cardNumber = "Please enter a valid card number";
      }

      // Card name validation
      if (!formData.cardName.trim()) {
        errors.cardName = "Name on card is required";
      }

      // Expiration date validation
      if (!formData.cardExpiration.trim()) {
        errors.cardExpiration = "Expiration date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiration)) {
        errors.cardExpiration = "Please use MM/YY format";
      }

      // CVC validation
      if (!formData.cardCvc.trim()) {
        errors.cardCvc = "CVC is required";
      } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
        errors.cardCvc = "Please enter a valid CVC";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to your cart before checking out.");
      navigate("/cart");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format shipping info
      const shippingInfo = {
        address: `${formData.address}${formData.apartment ? `, ${formData.apartment}` : ""}`,
        city: formData.city,
        state: formData.region,
        country: formData.country,
        pinCode: formData.postalCode,
        phoneNo: formData.phone,
      };

      // Format payment info based on selected payment method
      const paymentInfo = {
        id: "dummy-payment-id",
        status: "succeeded",
        method: selectedPaymentMethod.id,
      };

      // Format order data
      const orderData: CreateOrderRequest = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          product: item.productId,
        })),
        shippingInfo,
        paymentInfo,
      };

      // Submit order
      const response = await OrderService.createOrder(orderData);

      if (response.data.success) {
        // Clear cart
        dispatch(clearCart());

        // Navigate to success page or order details
        if (response.data.order?.id) {
          navigate(`/orders/${response.data.order.id}`);
        } else {
          navigate("/orders");
        }
      } else {
        alert(response.data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred while processing your order. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryFee = parseFloat(selectedDeliveryMethod.price);
  const totalPrice = cartTotal + deliveryFee;

  return (
    <div className="bg-white">
      {/* Background color split screen for large screens */}
      <div
        className="fixed top-0 left-0 hidden h-full w-1/2 bg-white lg:block"
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 hidden h-full w-1/2 bg-gray-50 lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
        <h1 className="sr-only">Checkout</h1>

        <section
          aria-labelledby="summary-heading"
          className="bg-gray-50 px-4 pb-10 pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <ul role="list" className="divide-y divide-gray-200 text-sm font-medium text-gray-900">
              {cartItems.map(item => (
                <li key={item.productId} className="flex items-start space-x-4 py-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 flex-none rounded-md object-cover object-center"
                  />
                  <div className="flex-auto space-y-1">
                    <h3>{item.name}</h3>
                    <p className="text-gray-500">Qty {item.quantity}</p>
                  </div>
                  <p className="flex-none text-base font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd>${cartTotal.toFixed(2)}</dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd>${deliveryFee.toFixed(2)}</dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <dt className="text-base">Total</dt>
                <dd className="text-base">${totalPrice.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="fixed inset-x-0 bottom-0 z-10 lg:hidden">
              <div className="border-t border-gray-200 bg-white py-6 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">${totalPrice.toFixed(2)}</dd>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                  >
                    {isSubmitting ? "Processing..." : "Confirm order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <form
          id="checkout-form"
          className="px-4 pb-36 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16"
          onSubmit={handleSubmit}
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <section aria-labelledby="contact-info-heading">
              <h2 id="contact-info-heading" className="text-lg font-medium text-gray-900">
                Contact information
              </h2>

              <div className="mt-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      formErrors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </section>

            <section aria-labelledby="shipping-heading" className="mt-10">
              <h2 id="shipping-heading" className="text-lg font-medium text-gray-900">
                Shipping information
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        formErrors.firstName ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        formErrors.lastName ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        formErrors.address ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.address && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                    Apartment, suite, etc.
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        formErrors.city ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.city && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                    State / Province
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        formErrors.region ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.region && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.region}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        formErrors.postalCode ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.postalCode && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <div className="mt-1">
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        formErrors.country ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="India">India</option>
                      <option value="Australia">Australia</option>
                    </select>
                    {formErrors.country && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.country}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="delivery-heading" className="mt-10">
              <h2 id="delivery-heading" className="text-lg font-medium text-gray-900">
                Delivery method
              </h2>

              <RadioGroup
                value={selectedDeliveryMethod}
                onChange={setSelectedDeliveryMethod}
                className="mt-4"
              >
                <RadioGroup.Label className="sr-only">Delivery method</RadioGroup.Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {deliveryMethods.map(deliveryMethod => (
                    <RadioGroup.Option
                      key={deliveryMethod.id}
                      value={deliveryMethod}
                      className={({ checked }) =>
                        `relative block cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm focus:outline-none ${
                          checked ? "border-indigo-500 ring-2 ring-indigo-500" : ""
                        }`
                      }
                    >
                      {({ checked }) => (
                        <>
                          <RadioGroup.Label as="p" className="text-base font-medium text-gray-900">
                            {deliveryMethod.title}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="div"
                            className="mt-1 flex items-center text-sm text-gray-500"
                          >
                            <span>{deliveryMethod.turnaround}</span>
                          </RadioGroup.Description>
                          <RadioGroup.Description
                            as="div"
                            className="mt-2 text-sm font-medium text-gray-900"
                          >
                            ${deliveryMethod.price}
                          </RadioGroup.Description>
                          <div
                            className={`absolute right-3 top-3 ${
                              checked ? "text-indigo-600" : "invisible"
                            }`}
                            aria-hidden="true"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </div>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
            </section>

            <section aria-labelledby="payment-heading" className="mt-10">
              <h2 id="payment-heading" className="text-lg font-medium text-gray-900">
                Payment method
              </h2>

              <RadioGroup
                value={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                className="mt-4"
              >
                <RadioGroup.Label className="sr-only">Payment method</RadioGroup.Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {paymentMethods.map(paymentMethod => (
                    <RadioGroup.Option
                      key={paymentMethod.id}
                      value={paymentMethod}
                      className={({ checked }) =>
                        `relative block cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm focus:outline-none ${
                          checked ? "border-indigo-500 ring-2 ring-indigo-500" : ""
                        }`
                      }
                    >
                      {({ checked }) => (
                        <>
                          <RadioGroup.Label as="p" className="text-base font-medium text-gray-900">
                            {paymentMethod.title}
                          </RadioGroup.Label>
                          <div
                            className={`absolute right-3 top-3 ${
                              checked ? "text-indigo-600" : "invisible"
                            }`}
                            aria-hidden="true"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </div>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>

              {selectedPaymentMethod.id === "credit-card" && (
                <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-4">
                  <div className="sm:col-span-4">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          formErrors.cardNumber ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.cardNumber && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.cardNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Name on card
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          formErrors.cardName ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.cardName && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.cardName}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="cardExpiration"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Expiration date (MM/YY)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardExpiration"
                        name="cardExpiration"
                        value={formData.cardExpiration}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          formErrors.cardExpiration ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.cardExpiration && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.cardExpiration}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardCvc"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          formErrors.cardCvc ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.cardCvc && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.cardCvc}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="mt-10 border-t border-gray-200 pt-6 sm:flex sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:ml-6 sm:w-auto disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
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
                  </div>
                ) : (
                  "Confirm order"
                )}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500 sm:mt-0 sm:text-left">
                You won't be charged until the next step
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
