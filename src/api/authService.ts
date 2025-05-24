import { apiHelper } from "./config";

export interface User {
  _id?: string;
  name: string;
  email: string;
  avatar?: {
    public_id: string;
    url: string;
  };
  role?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface UserListResponse {
  success: boolean;
  users: User[];
  count: number;
}

export interface PasswordUpdateData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  avatar?: File;
}

const AuthService = {
  /**
   * Register a new user
   */
  register: (userData: FormData) =>
    apiHelper.post<AuthResponse>("/register", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Login user
   */
  login: (email: string, password: string) =>
    apiHelper.post<AuthResponse>("/login", { email, password }),

  /**
   * Logout user
   */
  logout: () => apiHelper.get<{ success: boolean; message: string }>("/logout"),

  /**
   * Get currently logged in user profile
   */
  getMyProfile: () => apiHelper.get<AuthResponse>("/me"),

  /**
   * Update password
   */
  updatePassword: (passwordData: PasswordUpdateData) =>
    apiHelper.put<AuthResponse>("/password/update", passwordData),

  /**
   * Update profile
   */
  updateProfile: (userData: FormData) =>
    apiHelper.put<AuthResponse>("/me/update", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Forgot password - sends password reset email
   */
  forgotPassword: (email: string) =>
    apiHelper.post<{ success: boolean; message: string }>("/password/forgot", { email }),

  /**
   * Reset password with token
   */
  resetPassword: (token: string, password: string, confirmPassword: string) =>
    apiHelper.put<AuthResponse>(`/password/reset/${token}`, { password, confirmPassword }),

  /**
   * Get all users (admin only)
   */
  getAllUsers: () => apiHelper.get<UserListResponse>("/admin/users"),

  /**
   * Get user details (admin only)
   */
  getUserDetails: (userId: string) => apiHelper.get<AuthResponse>(`/admin/users/${userId}`),

  /**
   * Update user role (admin only)
   */
  updateUserRole: (userId: string, role: string) =>
    apiHelper.put<AuthResponse>(`/admin/users/${userId}`, { role }),

  /**
   * Delete user (admin only)
   */
  deleteUser: (userId: string) => apiHelper.delete<AuthResponse>(`/admin/users/${userId}`),
};

export default AuthService;
