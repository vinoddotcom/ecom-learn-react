import type { Product } from "./productService";

// Sample product data for testing
export const sampleProducts: Product[] = [
  {
    _id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    description: "Premium wireless headphones with noise cancellation and 20-hour battery life.",
    rating: 4.5,
    images: [
      {
        public_id: "products/headphones",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
      },
    ],
    category: "Electronics",
    Stock: 50,
    numOfReviews: 25,
    reviews: [
      {
        name: "User 1",
        rating: 5,
        comment: "Great sound quality and battery life!",
      },
    ],
  },
  {
    _id: "2",
    name: "Smart Watch",
    price: 149.99,
    description: "Smart watch with fitness tracking, heart rate monitoring, and notifications.",
    rating: 4.2,
    images: [
      {
        public_id: "products/smartwatch",
        url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
      },
    ],
    category: "Electronics",
    Stock: 35,
    numOfReviews: 18,
    reviews: [
      {
        name: "User 2",
        rating: 4,
        comment: "Good features for the price",
      },
    ],
  },
  {
    _id: "3",
    name: "Leather Wallet",
    price: 49.99,
    description: "Genuine leather wallet with RFID protection and multiple card slots.",
    rating: 4.8,
    images: [
      {
        public_id: "products/wallet",
        url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
      },
    ],
    category: "Fashion",
    Stock: 100,
    numOfReviews: 32,
    reviews: [
      {
        name: "User 3",
        rating: 5,
        comment: "High quality leather and excellent craftsmanship",
      },
    ],
  },
];

// Mock response generator for products endpoint
export const getMockProductsResponse = () => {
  return {
    success: true,
    products: sampleProducts,
    productsCount: sampleProducts.length,
    resultPerPage: sampleProducts.length,
    filteredProductsCount: sampleProducts.length,
  };
};

// Mock response generator for product detail endpoint
export const getMockProductResponse = (productId: string) => {
  const product = sampleProducts.find(p => p._id === productId);
  return {
    success: !!product,
    product,
    message: product ? undefined : "Product not found",
  };
};

// Add other mock responses for different API endpoints as needed
