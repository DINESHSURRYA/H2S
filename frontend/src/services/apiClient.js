/**
 * Low-level API Client for reusable fetch calls.
 * @param {string} url - The URL endpoint to call.
 * @param {object} options - Optional fetch configuration.
 * @returns {Promise<any>} - The JSON response from the server.
 */
/**
 * Low-level API Client for reusable fetch calls.
 * @param {string} endpoint - The API endpoint to call (e.g., '/ngo/login').
 * @param {object} options - Optional fetch configuration.
 * @returns {Promise<any>} - The JSON response from the server.
 */
export const apiClient = async (endpoint, options = {}) => {
  const { method = 'GET', data, headers = {}, ...rest } = options;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  console.log("Endpoint  : ", url);
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(url, config);
    
    const responseData = await res.json();
    
    if (!res.ok) {
      const error = new Error(responseData.message || `HTTP error! status: ${res.status}`);
      error.status = res.status;
      error.data = responseData;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    console.error(`[apiClient] Fetch error on ${endpoint}:`, error.message);
    throw error;
  }
};
