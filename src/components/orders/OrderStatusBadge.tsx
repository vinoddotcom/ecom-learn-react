import React from "react";
import { getStatusBadgeClass } from "../../utils/getCssClasses";

interface OrderStatusBadgeProps {
  status?: string;
  className?: string;
}

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
