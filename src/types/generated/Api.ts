/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface OrderItem {
  /** Name of the product */
  name: string;
  /** Price of the product */
  price: number;
  /** Quantity ordered */
  quantity: number;
  /** Image URL of the product */
  image: string;
  /** ID of the product */
  product: string;
}

export interface ShippingInfo {
  /** Street address */
  address: string;
  /** City name */
  city: string;
  /** State or province */
  state: string;
  /** Country name */
  country: string;
  /** Postal or PIN code */
  pinCode: number;
  /** Contact phone number */
  phoneNo: number;
}

export interface PaymentInfo {
  /** Payment transaction ID */
  id: string;
  /** Payment status */
  status: string;
}

export interface Order {
  /** Auto-generated unique identifier */
  _id?: string;
  shippingInfo?: ShippingInfo;
  orderItems?: OrderItem[];
  /** ID of the user who placed the order */
  user?: string;
  paymentInfo?: PaymentInfo;
  /**
   * Date and time when payment was made
   * @format date-time
   */
  paidAt?: string;
  /** Price of all items combined */
  itemsPrice?: number;
  /** Tax amount */
  taxPrice?: number;
  /** Shipping cost */
  shippingPrice?: number;
  /** Total order amount including tax and shipping */
  totalPrice?: number;
  /**
   * Current status of the order
   * @default "Processing"
   */
  orderStatus?: "Processing" | "Shipped" | "Delivered";
  /**
   * Date and time when order was delivered
   * @format date-time
   */
  deliveredAt?: string;
  /**
   * Date and time when order was created
   * @format date-time
   */
  createdAt?: string;
}

/** @example {"name":"iPhone 13 Pro","description":"6.1-inch Super Retina XDR display with ProMotion","price":999.99,"category":"Electronics","Stock":50,"images":[{"public_id":"products/iphone13","url":"https://res.cloudinary.com/example/image/upload/v1234/products/iphone13.jpg"}]} */
export interface Product {
  /** Auto-generated unique identifier */
  _id?: string;
  /** Product name */
  name: string;
  /** Detailed product description */
  description: string;
  /** Product price */
  price: number;
  /**
   * Average product rating
   * @default 0
   */
  ratings?: number;
  /** Array of product images. Note - when creating/updating products, send base64 encoded strings, not these objects. */
  images?: {
    /** Cloudinary public ID for the image */
    public_id?: string;
    /** Cloudinary URL to access the image */
    url?: string;
  }[];
  /** Product category */
  category: string;
  /** Available stock quantity */
  Stock: number;
  /**
   * Number of reviews
   * @default 0
   */
  numOfReviews?: number;
  reviews?: {
    user?: string;
    name?: string;
    rating?: number;
    comment?: string;
  }[];
  /** ID of user who created the product */
  user?: string;
  /** @format date-time */
  createdAt?: string;
}

/** @example {"name":"John Doe","email":"john@example.com","password":"password123","role":"user","avatar":{"public_id":"avatars/123","url":"https://res.cloudinary.com/example/image/upload/v1234/avatars/123.jpg"}} */
export interface User {
  /** Auto-generated unique identifier */
  _id?: string;
  /** User's full name */
  name: string;
  /**
   * User's email address
   * @format email
   */
  email: string;
  /**
   * User's password
   * @format password
   */
  password: string;
  /** User's avatar image information (optional, default provided) */
  avatar?: {
    /** Cloudinary public ID for the avatar image */
    public_id?: string;
    /** URL to access the avatar image */
    url?: string;
  };
  /** @default "user" */
  role?: "user" | "admin";
  /** @format date-time */
  createdAt?: string;
}

/** @example {"email":"john@example.com","password":"password123"} */
export interface LoginInput {
  /** @format email */
  email: string;
  /** @format password */
  password: string;
}

/** @example {"name":"John Doe","email":"john@example.com","password":"password123"} */
export interface RegisterInput {
  name: string;
  /** @format email */
  email: string;
  /** @format password */
  password: string;
  /**
   * Optional user avatar image (base64 encoded)
   * @format binary
   */
  avatar?: File;
}

export namespace Order {
  /**
   * @description Place a new order with product details, shipping information and payment details
   * @tags Orders
   * @name PostOrder
   * @summary Create a new order
   * @request POST:/order/new
   * @secure
   */
  export namespace PostOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      shippingInfo: ShippingInfo;
      orderItems: OrderItem[];
      paymentInfo: PaymentInfo;
      itemsPrice: number;
      taxPrice: number;
      shippingPrice: number;
      totalPrice: number;
    };
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      order?: Order;
    };
  }

  /**
   * @description Get detailed information about a specific order
   * @tags Orders
   * @name OrderDetail
   * @summary Get order details
   * @request GET:/order/{id}
   * @secure
   */
  export namespace OrderDetail {
    export type RequestParams = {
      /** Order ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      order?: Order;
    };
  }
}

export namespace Orders {
  /**
   * @description Get all orders placed by the currently logged in user
   * @tags Orders
   * @name GetOrders
   * @summary Get my orders
   * @request GET:/orders/me
   * @secure
   */
  export namespace GetOrders {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      orders?: Order[];
    };
  }
}

export namespace Admin {
  /**
   * @description Retrieve a list of all orders (Admin only)
   * @tags Admin
   * @name OrdersList
   * @summary Get all orders
   * @request GET:/admin/orders
   * @secure
   */
  export namespace OrdersList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      totalAmount?: number;
      orders?: Order[];
    };
  }

  /**
   * @description Update the status of an order (Admin only)
   * @tags Admin
   * @name OrderUpdate
   * @summary Update order status
   * @request PUT:/admin/order/{id}
   * @secure
   */
  export namespace OrderUpdate {
    export type RequestParams = {
      /** Order ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = {
      /** New order status */
      status: "Processing" | "Shipped" | "Delivered";
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Remove an order from the database (Admin only)
   * @tags Admin
   * @name OrderDelete
   * @summary Delete order
   * @request DELETE:/admin/order/{id}
   * @secure
   */
  export namespace OrderDelete {
    export type RequestParams = {
      /** Order ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Get all products for admin dashboard without pagination
   * @tags Admin
   * @name ProductsList
   * @summary Get all products (Admin)
   * @request GET:/admin/products
   * @secure
   */
  export namespace ProductsList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      products?: Product[];
    };
  }

  /**
   * @description Add a new product to the database (Admin only). For images, send an array of base64-encoded image strings which will be uploaded to Cloudinary.
   * @tags Admin
   * @name ProductNewCreate
   * @summary Create a new product
   * @request POST:/admin/product/new
   * @secure
   */
  export namespace ProductNewCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      name: string;
      description: string;
      price: number;
      category: string;
      Stock: number;
      /** Array of base64 encoded image strings which will be uploaded to Cloudinary */
      images?: string[];
    };
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      product?: Product;
    };
  }

  /**
   * @description Update an existing product by ID (Admin only). For images, send an array of base64-encoded image strings which will be uploaded to Cloudinary.
   * @tags Admin
   * @name ProductUpdate
   * @summary Update a product
   * @request PUT:/admin/product/{id}
   * @secure
   */
  export namespace ProductUpdate {
    export type RequestParams = {
      /** Product ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      Stock?: number;
      /** Array of base64 encoded image strings which will be uploaded to Cloudinary */
      images?: string[];
    };
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      product?: Product;
    };
  }

  /**
   * @description Remove a product from the database (Admin only)
   * @tags Admin
   * @name ProductDelete
   * @summary Delete a product
   * @request DELETE:/admin/product/{id}
   * @secure
   */
  export namespace ProductDelete {
    export type RequestParams = {
      /** Product ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Retrieve a list of all user accounts (Admin only)
   * @tags Admin
   * @name UsersList
   * @summary Get all users
   * @request GET:/admin/users
   * @secure
   */
  export namespace UsersList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      users?: User[];
    };
  }

  /**
   * @description Retrieve details for a specific user (Admin only)
   * @tags Admin
   * @name UserDetail
   * @summary Get user details
   * @request GET:/admin/user/{id}
   * @secure
   */
  export namespace UserDetail {
    export type RequestParams = {
      /** User ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      user?: User;
    };
  }

  /**
   * @description Change a user's role (Admin only)
   * @tags Admin
   * @name UserUpdate
   * @summary Update user role
   * @request PUT:/admin/user/{id}
   * @secure
   */
  export namespace UserUpdate {
    export type RequestParams = {
      /** User ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = {
      role: "user" | "admin";
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Delete a user account (Admin only)
   * @tags Admin
   * @name UserDelete
   * @summary Delete user
   * @request DELETE:/admin/user/{id}
   * @secure
   */
  export namespace UserDelete {
    export type RequestParams = {
      /** User ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}

export namespace Products {
  /**
   * @description Fetch all products with filtering, pagination, and search capabilities
   * @tags Products
   * @name ProductsList
   * @summary Get all products
   * @request GET:/products
   */
  export namespace ProductsList {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Search products by name */
      keyword?: string;
      /** Filter products by category */
      category?: string;
      /** Minimum price filter */
      "price[gte]"?: number;
      /** Maximum price filter */
      "price[lte]"?: number;
      /** Minimum ratings filter */
      "ratings[gte]"?: number;
      /** Page number for pagination */
      page?: number;
      /** Number of products per page */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      products?: Product[];
      productsCount?: number;
      resultPerPage?: number;
      filteredProductsCount?: number;
    };
  }
}

export namespace Product {
  /**
   * @description Get detailed information about a specific product
   * @tags Products
   * @name ProductDetail
   * @summary Get product details
   * @request GET:/product/{id}
   */
  export namespace ProductDetail {
    export type RequestParams = {
      /** Product ID */
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      product?: Product;
    };
  }
}

export namespace Review {
  /**
   * @description Add a new review or update an existing review for a product
   * @tags Reviews
   * @name ReviewUpdate
   * @summary Create or update a review
   * @request PUT:/review
   * @secure
   */
  export namespace ReviewUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      /** ID of the product to review */
      productId: string;
      /**
       * Rating from 1 to 5
       * @min 1
       * @max 5
       */
      rating: number;
      /** Review comment */
      comment: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}

export namespace Reviews {
  /**
   * @description Retrieve all reviews for a specific product
   * @tags Reviews
   * @name ReviewsList
   * @summary Get all reviews for a product
   * @request GET:/reviews
   */
  export namespace ReviewsList {
    export type RequestParams = {};
    export type RequestQuery = {
      /** ID of the product to get reviews for */
      productId: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      reviews?: {
        user?: string;
        name?: string;
        rating?: number;
        comment?: string;
        _id?: string;
      }[];
    };
  }

  /**
   * @description Remove a specific review from a product
   * @tags Reviews
   * @name ReviewsDelete
   * @summary Delete a review
   * @request DELETE:/reviews
   * @secure
   */
  export namespace ReviewsDelete {
    export type RequestParams = {};
    export type RequestQuery = {
      /** ID of the product containing the review */
      productId: string;
      /** ID of the review to delete */
      reviewId: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}

export namespace Register {
  /**
   * @description Create a new user account with name, email, password and optional profile picture
   * @tags User Authentication
   * @name RegisterCreate
   * @summary Register a new user
   * @request POST:/register
   */
  export namespace RegisterCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegisterInput;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      token?: string;
      user?: User;
    };
  }
}

export namespace Login {
  /**
   * @description Authenticate a user and return JWT token
   * @tags User Authentication
   * @name LoginCreate
   * @summary Login a user
   * @request POST:/login
   */
  export namespace LoginCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginInput;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      token?: string;
      user?: User;
    };
  }
}

export namespace Password {
  /**
   * @description Send password reset email with token
   * @tags User Authentication
   * @name ForgotCreate
   * @summary Request password reset
   * @request POST:/password/forgot
   */
  export namespace ForgotCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      /** @format email */
      email: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Reset password using token received in email
   * @tags User Authentication
   * @name ResetUpdate
   * @summary Reset password
   * @request PUT:/password/reset/{token}
   */
  export namespace ResetUpdate {
    export type RequestParams = {
      /** Password reset token sent to email */
      token: string;
    };
    export type RequestQuery = {};
    export type RequestBody = {
      /** @format password */
      password: string;
      /** @format password */
      confirmPassword: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * @description Update the password for the currently logged in user
   * @tags User Profile
   * @name UpdateUpdate
   * @summary Update user password
   * @request PUT:/password/update
   * @secure
   */
  export namespace UpdateUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      /** @format password */
      oldPassword: string;
      /** @format password */
      newPassword: string;
      /** @format password */
      confirmPassword: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}

export namespace Logout {
  /**
   * @description Log out the user by clearing authentication cookies
   * @tags User Authentication
   * @name LogoutList
   * @summary Log out a user
   * @request GET:/logout
   */
  export namespace LogoutList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}

export namespace Me {
  /**
   * @description Retrieves the profile of the currently logged in user
   * @tags User Profile
   * @name GetMe
   * @summary Get current user details
   * @request GET:/me
   * @secure
   */
  export namespace GetMe {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      success?: boolean;
      user?: User;
    };
  }

  /**
   * @description Update the name and email for the currently logged in user
   * @tags User Profile
   * @name UpdateUpdate
   * @summary Update user profile
   * @request PUT:/me/update
   * @secure
   */
  export namespace UpdateUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      name?: string;
      /** @format email */
      email?: string;
      /**
       * Optional - new profile picture
       * @format binary
       */
      avatar?: File;
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
