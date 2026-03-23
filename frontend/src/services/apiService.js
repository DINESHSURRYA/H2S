import { apiClient } from "./apiClient.js";

/**
 * Mid-level API Service to abstract logic away from components.
 */

// Fetch the user's profile information
export const getProfile = async () => {
  // Calls low-level apiClient for the /profile endpoint
  return await apiClient("/profile");
};

// Fetch general user information
export const getUser = async () => {
  // Calls low-level apiClient for the /user endpoint
  return await apiClient("/user");
};
