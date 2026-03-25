import { apiClient } from "./apiClient.js";

/**
 * API Service Layer.
 * All API calls should be defined here using the apiClient.
 * Each function abstracts a single backend endpoint.
 */

export const registerNgo = (data) => {
  return apiClient('/ngo/register', {
    method: 'POST',
    data,
  });
};

export const loginNgo = (data) => {
  return apiClient('/ngo/login', {
    method: 'POST',
    data,
  });
};

export const registerVolunteer = (data) => {
  return apiClient('/volunteer/register', {
    method: 'POST',
    data,
  });
};

export const loginVolunteer = (data) => {
  return apiClient('/volunteer/login', {
    method: 'POST',
    data,
  });
};
