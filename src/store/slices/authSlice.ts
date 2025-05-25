import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import AuthService, { type User, type AuthResponse } from "../../api/authService";
import { clearCart } from "./cartSlice";

// Define types
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null, // API handles token via cookies
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(email, password);
      return response; // Removed .data
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Login failed");
      }
      return rejectWithValue("Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData: FormData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      return response; // Removed .data
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Registration failed");
      }
      return rejectWithValue("Registration failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
  clearCart()
  // No need to manually remove token - handled by API via cookies
  return null;
});

export const getUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getMyProfile();
      return response; // Removed .data
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(
          axiosError.response?.data?.message || "Failed to fetch user profile"
        );
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to fetch user profile");
      }
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

// Create the slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAuthenticated = Boolean(action.payload.success);
        // API handles cookie-based authentication, no need to store token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAuthenticated = Boolean(action.payload.success);
        // API handles cookie-based authentication, no need to store token
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, state => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, state => {
        state.loading = false;
        // Even if logout request fails, we clear the local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Get user profile
    builder
      .addCase(getUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        // No need to manually remove token - handled by API via cookies
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

