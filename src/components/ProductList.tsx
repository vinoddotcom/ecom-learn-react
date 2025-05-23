import React from "react";
import { ProductService, type ProductListResponse } from "../api";
import { useFetch } from "../hooks/useFetch";
import "./ProductList.css";

// Example component that uses the API
const ProductList: React.FC = () => {
  const { data, loading, error, refetch } = useFetch<ProductListResponse>(
    () => ProductService.getProducts(),
    []
  );

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );

  const products = data?.products || [];

  return (
    <div className="products-container">
      <h2>Products</h2>
      {import.meta.env.VITE_USE_MOCK_API === "true" && (
        <div className="mock-data-notice">
          Using mock data. Set VITE_USE_MOCK_API=false in .env to use real API.
        </div>
      )}
      <div className="product-grid">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product._id} className="product-card">
              {product.images && product.images.length > 0 && (
                <img src={product.images[0].url} alt={product.name} className="product-image" />
              )}
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <p>{product.description.substring(0, 100)}...</p>
              <button className="add-to-cart-btn">Add to Cart</button>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
