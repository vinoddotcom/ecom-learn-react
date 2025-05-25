import React from "react";

interface OrderStatusBadgeProps {
  status?: string;
  className?: string;
}

export const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case "Processing":
      return "bg-yellow-100 text-yellow-800";
    case "Shipped":
      return "bg-blue-100 text-blue-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = "" }) => {
  const badgeClass = getStatusBadgeClass(status);

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass} ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default OrderStatusBadge;
