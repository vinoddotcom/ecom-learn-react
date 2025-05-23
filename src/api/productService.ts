import { apiHelper } from "./config";

export interface Product {
  _id?: string;
  name: string;
  price: number;
  description: string;
  rating?: number;
  images?: {
    public_id: string;
    url: string;
  }[];
  category: string;
  stock: number;
  numOfReviews?: number;
  reviews?: {
    name: string;
    rating: number;
    comment: string;
  }[];
  createdAt?: string;
}

export interface ProductListResponse {
  success: boolean;
  products: Product[];
  productsCount: number;
  resultPerPage?: number;
  filteredProductsCount?: number;
}

export interface ProductResponse {
  success: boolean;
  product?: Product;
  message?: string;
}

export interface ProductFilters {
  keyword?: string;
  category?: string;
  price?: {
    gte?: number; // Greater than or equal
    lte?: number; // Less than or equal
  };
  ratings?: number;
  page?: number;
  limit?: number;
}

const ProductService = {
  /**
   * Get all products with optional filtering
   */
  getProducts: (filters?: ProductFilters) => {
    // Convert filters to query params
    let queryParams = "";

    if (filters) {
      const params = new URLSearchParams();

      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.category) params.append("category", filters.category);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      if (filters.price) {
        if (filters.price.gte) params.append("price[gte]", filters.price.gte.toString());
        if (filters.price.lte) params.append("price[lte]", filters.price.lte.toString());
      }

      if (filters.ratings) params.append("ratings[gte]", filters.ratings.toString());

      queryParams = `?${params.toString()}`;
    }

    return apiHelper.get<ProductListResponse>(`/products${queryParams}`);
  },

  /**
   * Get product by ID
   */
  getProductById: (productId: string) => apiHelper.get<ProductResponse>(`/products/${productId}`),

  /**
   * Create new product (admin only)
   */
  createProduct: (productData: FormData) =>
    apiHelper.post<ProductResponse>("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Update product (admin only)
   */
  updateProduct: (productId: string, productData: FormData) =>
    apiHelper.put<ProductResponse>(`/products/${productId}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Delete product (admin only)
   */
  deleteProduct: (productId: string) => apiHelper.delete<ProductResponse>(`/products/${productId}`),

  /**
   * Create or update review
   */
  createProductReview: (
    productId: string,
    reviewData: {
      rating: number;
      comment: string;
    }
  ) =>
    apiHelper.put<{ success: boolean; message?: string }>(
      `/products/${productId}/review`,
      reviewData
    ),
};

export default ProductService;
