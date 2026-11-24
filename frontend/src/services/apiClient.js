/**
 * Low-level API Client for reusable fetch calls.
 * The single network touchpoint for the H2S frontend.
 */
export const apiClient = async (endpoint, options = {}) => {
  const { method = 'GET', data, headers = {}, ...rest } = options;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const ngoToken = localStorage.getItem('ngoToken');
  const volunteerToken = localStorage.getItem('volunteerToken');
  const token = ngoToken || volunteerToken;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(url, config);
  const contentType = res.headers.get('content-type');
  let responseData;

  if (contentType && contentType.includes('application/json')) {
    responseData = await res.json();
  } else {
    const textData = await res.text();
    responseData = { message: textData || `HTTP error! status: ${res.status}` };
  }

  if (!res.ok) {
    const error = new Error(responseData.message || `HTTP error! status: ${res.status}`);
    error.status = res.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
};
