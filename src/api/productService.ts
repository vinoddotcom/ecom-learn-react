import { apiHelper } from "./config";

export interface Review {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  user?: string;
  createdAt?: string;
}

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
  Stock: number;
  numOfReviews?: number;
  reviews?: Review[];
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
  getProductById: (productId: string) => apiHelper.get<ProductResponse>(`/product/${productId}`),

  /**
   * Get product details with reviews
   */
  getProductDetails: (productId: string) => apiHelper.get<ProductResponse>(`/product/${productId}`),

  /**
   * Create new product (admin only)
   */
  createProduct: (productData: FormData) =>
    apiHelper.post<ProductResponse>("/admin/product/new", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Update product (admin only)
   */
  updateProduct: (productId: string, productData: FormData) =>
    apiHelper.put<ProductResponse>(`/admin/product/${productId}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Delete product (admin only)
   */
  deleteProduct: (productId: string) =>
    apiHelper.delete<ProductResponse>(`/admin/product/${productId}`),

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

  /**
   * Submit a review for a product using the /review endpoint as per API spec
   */
  submitReview: (
    productId: string,
    reviewData: {
      rating: number;
      comment: string;
    }
  ) =>
    apiHelper.put<{ success: boolean; message?: string }>(`/review`, {
      productId,
      ...reviewData,
    }),

  /**
   * Get all reviews for a product
   */
  getProductReviews: (productId: string) =>
    apiHelper.get<{ success: boolean; reviews: Review[] }>(`/reviews?productId=${productId}`),

  /**
   * Delete a review
   */
  deleteReview: (productId: string, reviewId: string) =>
    apiHelper.delete<{ success: boolean; message?: string }>(
      `/reviews?productId=${productId}&reviewId=${reviewId}`
    ),
};

export default ProductService;
