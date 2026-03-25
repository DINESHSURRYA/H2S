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

export const createHelpRequest = (data) => {
  return apiClient('/help-request/create', {
    method: 'POST',
    data,
  });
};

export const getPendingRequests = () => {
  return apiClient('/help-request/pending');
};

export const getVolunteerRequests = (volunteerId) => {
  return apiClient(`/help-request/volunteer/${volunteerId}`);
};

export const getVolunteerRaisedRequests = (volunteerId) => {
  return apiClient(`/help-request/volunteer/${volunteerId}/raised`);
};

export const approveHelpRequest = (id, volunteerId) => {
  return apiClient(`/help-request/${id}/approve`, {
    method: 'PUT',
    data: { volunteerId }
  });
};
