import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import AuthService from "../../api/authService";
import type { User, UserListResponse } from "../../api/authService";

interface UserWithActions extends User {
  isDeleting?: boolean;
  isChangingRole?: boolean;
}

const AdminUsersList: React.FC = () => {
  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: UserListResponse = await AuthService.getAllUsers();
      if (response.success) {
        setUsers(response.users.map(user => ({ ...user, isDeleting: false, isChangingRole: false })));
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (userId: string | undefined, currentRole: string | undefined) => {
    if (!userId) return;

    try {
      // Mark user as changing role
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isChangingRole: true } : user
        )
      );

      // Toggle between "admin" and "user" roles
      const newRole = currentRole === "admin" ? "user" : "admin";
      const response = await AuthService.updateUserRole(userId, newRole);
      
      if (response.success) {
        // Update user in state with new role
        setUsers(prev => 
          prev.map(user => 
            user._id === userId ? { ...user, role: newRole, isChangingRole: false } : user
          )
        );
        setSuccessMessage(`Changed ${currentRole} to ${newRole} successfully`);
      } else {
        setError("Failed to update user role");
        // Reset changing state
        setUsers(prev => 
          prev.map(user => 
            user._id === userId ? { ...user, isChangingRole: false } : user
          )
        );
      }
    } catch (err) {
      console.error("Error updating role:", err);
      setError("An error occurred while updating role");
      // Reset changing state
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isChangingRole: false } : user
        )
      );
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle user delete
  const handleDelete = async (userId: string | undefined) => {
    if (!userId) return;
    
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      // Mark user as deleting
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isDeleting: true } : user
        )
      );

      const response = await AuthService.deleteUser(userId);
      
      if (response.success) {
        // Remove user from state
        setUsers(prev => prev.filter(user => user._id !== userId));
        setSuccessMessage("User deleted successfully");
      } else {
        setError("Failed to delete user");
        // Reset deleting state
        setUsers(prev => 
          prev.map(user => 
            user._id === userId ? { ...user, isDeleting: false } : user
          )
        );
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("An error occurred while deleting user");
      // Reset deleting state
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isDeleting: false } : user
        )
      );
    }

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <div className="flex items-center space-x-3">
            <Link to="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Dashboard
            </Link>
            <button
              onClick={() => fetchUsers()}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-gray-800">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading users data...
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registered On
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar?.url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar.url}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleRoleChange(user._id, user.role)}
                            disabled={user.isChangingRole}
                            className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                              user.isChangingRole ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {user.isChangingRole ? (
                              <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <PencilIcon className="h-3 w-3 mr-1" />
                            )}
                            {user.role === "admin" ? "Make User" : "Make Admin"}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={user.isDeleting}
                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                              user.isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {user.isDeleting ? (
                              <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <TrashIcon className="h-3 w-3 mr-1" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersList;
