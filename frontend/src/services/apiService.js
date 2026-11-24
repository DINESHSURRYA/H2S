import { apiClient } from './apiClient.js';

/**
 * API Service Layer.
 * Every backend endpoint has a corresponding function here.
 */

// Auth — NGO
export const registerNgo = (data) =>
  apiClient('/ngo/register', { method: 'POST', data });

export const loginNgo = (data) =>
  apiClient('/ngo/login', { method: 'POST', data });

export const getNgoProfile = (id) =>
  apiClient(`/ngo/${id}`);

export const getNgoStats = (id) =>
  apiClient(`/ngo/${id}/stats`);

// Auth & Profile — Volunteer
export const registerVolunteer = (data) =>
  apiClient('/volunteer/register', { method: 'POST', data });

export const loginVolunteer = (data) =>
  apiClient('/volunteer/login', { method: 'POST', data });

export const getVolunteerProfile = (id) =>
  apiClient(`/volunteer/${id}`);

export const updateVolunteerProfile = (id, data) =>
  apiClient(`/volunteer/${id}`, { method: 'PUT', data });

export const getUnverifiedVolunteers = () =>
  apiClient('/volunteer/unverified');

export const verifySkill = (data) =>
  apiClient('/volunteer/verify-skill', { method: 'POST', data });

// Help Requests & Crisis Coordination
export const getPlatformStats = () =>
  apiClient('/help-request/stats');

export const trackHelpRequest = (id) =>
  apiClient(`/help-request/track/${id}`);

export const createHelpRequest = (data) =>
  apiClient('/help-request/create', { method: 'POST', data });

export const getPendingRequests = () =>
  apiClient('/help-request/pending');

export const getUnapprovedRequests = () =>
  apiClient('/help-request/unapproved');

export const getApprovedRequests = () =>
  apiClient('/help-request/approved');

export const getRequestsByVolunteer = (volunteerId) =>
  apiClient(`/help-request/volunteer/${volunteerId}`);

export const approveHelpRequest = (id, volunteerId) =>
  apiClient(`/help-request/${id}/approve`, { method: 'PUT', data: { volunteerId } });

export const resolveHelpRequest = (id, volunteerId) =>
  apiClient(`/help-request/${id}/resolve`, { method: 'PUT', data: { volunteerId } });

export const voteHype = (id, volunteerId, points = 1) =>
  apiClient(`/help-request/${id}/hype`, { method: 'POST', data: { volunteerId, points } });

export const editHelpRequest = (id, data) =>
  apiClient(`/help-request/${id}`, { method: 'PUT', data });

export const assignVolunteer = (id, roleId, volunteerId) =>
  apiClient(`/help-request/${id}/assign/${roleId}`, { method: 'POST', data: { volunteerId } });

export const unassignVolunteer = (id, roleId, volunteerId) =>
  apiClient(`/help-request/${id}/unassign/${roleId}`, { method: 'POST', data: { volunteerId } });

// Granted Help / Resource Allocations
export const grantHelp = (data) =>
  apiClient('/grant-help', { method: 'POST', data });

export const getNgoGrants = (ngoId) =>
  apiClient(`/grant-help/ngo/${ngoId}`);

export const updateGrantStatus = (grantId, status) =>
  apiClient(`/grant-help/${grantId}/status`, { method: 'PATCH', data: { status } });

export const markAsReceived = (grantId) =>
  apiClient(`/grant-help/${grantId}/received`, { method: 'POST' });
