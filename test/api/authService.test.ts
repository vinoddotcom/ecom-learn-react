import { describe, it, expect, beforeEach } from "vitest";
import AuthService from "../../src/api/authService";
import { server } from "../../src/test/setup";
import { http, HttpResponse } from "msw";
import axios from "axios";

// Helper function when tests need to explicitly fail
const fail = (message: string) => expect(message).toBeFalsy();

describe("AuthService", () => {
  beforeEach(() => {
    // Reset any mocked responses before each test
    localStorage.clear();
  });

  describe("login", () => {
    it("should make a request to login endpoint and return user data", async () => {
      const response = await AuthService.login("test@example.com", "password123");

      // The response comes directly from the API without .data wrapper
      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
      if (response.user) {
        expect(response.user.email).toBe("test@example.com");
      } else {
        fail("User data should be defined");
      }
    });

    it("should handle login error", async () => {
      // Override the default handler for this specific test
      server.use(
        http.post("*/login", () => {
          return new HttpResponse(
            JSON.stringify({
              success: false,
              message: "Invalid email or password",
            }),
            { status: 401 }
          );
        })
      );

      try {
        await AuthService.login("wrong@example.com", "wrongpass");
        // If we reach here, the request didn't fail as expected
        fail("Expected login to fail with 401 error");
      } catch (error: unknown) {
        // Different error handling approach for Axios errors
        if (axios.isAxiosError(error) && error.response) {
          expect(error.response.status).toBe(401);
          expect(error.response.data.success).toBe(false);
        } else {
          // If we get here without a response, fail the test
          fail("Expected Axios error with response");
        }
      }
    });
  });

  describe("register", () => {
    it("should make a request to register endpoint and return user data", async () => {
      const formData = new FormData();
      formData.append("name", "Test User");
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      const response = await AuthService.register(formData);

      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
    });
  });

  describe("logout", () => {
    it("should make a request to logout endpoint", async () => {
      const response = await AuthService.logout();

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe("getMyProfile", () => {
    it("should make a request to get user profile", async () => {
      const response = await AuthService.getMyProfile();

      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      if (response.user) {
        expect(response.user.name).toBe("Test User");
      } else {
        fail("User data should be defined");
      }
    });
  });

  describe("updatePassword", () => {
    it("should make a request to update password", async () => {
      const passwordData = {
        oldPassword: "oldPass123",
        newPassword: "newPass123",
        confirmPassword: "newPass123",
      };

      const response = await AuthService.updatePassword(passwordData);

      expect(response.success).toBe(true);
    });
  });

  describe("updateProfile", () => {
    it("should make a request to update user profile", async () => {
      const formData = new FormData();
      formData.append("name", "Updated Name");
      formData.append("email", "updated@example.com");

      const response = await AuthService.updateProfile(formData);

      expect(response.success).toBe(true);
    });
  });

  describe("forgotPassword", () => {
    it("should make a request to forgot password endpoint", async () => {
      const response = await AuthService.forgotPassword("test@example.com");

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe("resetPassword", () => {
    it("should make a request to reset password endpoint", async () => {
      const response = await AuthService.resetPassword("reset-token", "newPass123", "newPass123");

      expect(response.success).toBe(true);
    });
  });

  describe("Admin endpoints", () => {
    it("should make a request to get all users", async () => {
      const response = await AuthService.getAllUsers();

      expect(response.success).toBe(true);
      expect(response.users).toBeDefined();
      expect(Array.isArray(response.users)).toBe(true);
    });

    it("should make a request to get user details", async () => {
      const response = await AuthService.getUserDetails("user123");

      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
    });

    it("should make a request to update user role", async () => {
      const response = await AuthService.updateUserRole("user123", "admin");

      expect(response.success).toBe(true);
    });

    it("should make a request to delete a user", async () => {
      const response = await AuthService.deleteUser("user123");

      expect(response.success).toBe(true);
    });
  });
});
