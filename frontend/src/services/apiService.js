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

// USED IN NGO
export const getUnapprovedRequests = () => {
  return apiClient('/help-request/unapproved');
};

export const getApprovedRequests = () => {
  return apiClient('/help-request/approved');
};

export const getMissions = getPendingRequests;


export const getRequestsByVolunteer = (volunteerId) => {
  return apiClient(`/help-request/volunteer/${volunteerId}`);
};

export const approveHelpRequest = (id, volunteerId) => {
  return apiClient(`/help-request/${id}/approve`, {
    method: 'PUT',
    data: { volunteerId }
  });
};

export const grantHelp = (data) => {
  return apiClient('/grant-help', {
    method: 'POST',
    data,
  });
};

export const voteHype = (id, volunteerId, points) => {
    return apiClient(`/help-request/${id}/hype`, {
        method: 'POST',
        data: { volunteerId, points }
    });
}

export const toggleLock = (id, isLocked, ngoId) => {
    return apiClient(`/help-request/${id}/lock`, {
        method: 'POST',
        data: { isLocked, ngoId }
    });
}

export const getNgoGrants = (ngoId) => {
  return apiClient(`/grant-help/ngo/${ngoId}`);
};

export const editHelpRequest = (id, data) => {
  return apiClient(`/help-request/${id}`, {
    method: 'PUT',
    data
  });
};

export const assignVolunteer = (id, roleId, volunteerId) => {
  return apiClient(`/help-request/${id}/assign/${roleId}`, {
    method: 'POST',
    data: { volunteerId }
  });
};

export const markAsReceived = (grantId) => {
  return apiClient(`/grant-help/${grantId}/received`, {
    method: 'POST'
  });
};

export const getUnverifiedVolunteers = () => {
  return apiClient('/volunteer/unverified');
};

export const verifySkill = (data) => {
  return apiClient('/volunteer/verify-skill', {
    method: 'POST',
    data
  });
};

export const getVolunteerProfile = (id) => {
  return apiClient(`/volunteer/${id}`);
};

export const updateVolunteerProfile = (id, data) => {
  return apiClient(`/volunteer/${id}`, {
    method: 'PUT',
    data
  });
};


