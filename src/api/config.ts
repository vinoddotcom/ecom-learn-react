import axios, { type AxiosRequestConfig, type AxiosResponse, AxiosError } from "axios";

// Base API configuration
const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || "https://api.vinod.digital/api/v1";

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important: Enables sending cookies with requests
});

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // No need to manually set auth headers - cookies are automatically sent with requests
    // The server will handle authentication via cookies

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;

      if (status === 401) {
        // Unauthorized - session expired or invalid
        // The server handles removing cookies
        // Optional: Redirect to login page
        // window.location.href = '/login';
      }

      if (status === 403) {
        // Forbidden - user doesn't have permission
        console.error("You do not have permission to access this resource");
      }

      if (status === 404) {
        // Not found
        console.error("Resource not found");
      }

      if (status >= 500) {
        // Server error
        console.error("Server error occurred. Please try again later.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server. Check your internet connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Helper functions for common API operations
export const apiHelper = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance
      .get<T>(url, config)
      .then(response => response.data)
      .catch(error => {
        console.error(`GET request to ${url} failed:`, error);
        throw error;
      }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance
      .post<T>(url, data, config)
      .then(response => response.data)
      .catch(error => {
        console.error(`POST request to ${url} failed:`, error);
        throw error;
      }),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance
      .put<T>(url, data, config)
      .then(response => response.data)
      .catch(error => {
        console.error(`PUT request to ${url} failed:`, error);
        throw error;
      }),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance
      .patch<T>(url, data, config)
      .then(response => response.data)
      .catch(error => {
        console.error(`PATCH request to ${url} failed:`, error);
        throw error;
      }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance
      .delete<T>(url, config)
      .then(response => response.data)
      .catch(error => {
        console.error(`DELETE request to ${url} failed:`, error);
        throw error;
      }),
};
