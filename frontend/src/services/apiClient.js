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

  console.log(`[apiClient] Request: ${method} ${url} (Base: "${baseUrl}")`);
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
    
    // Check if the response is JSON
    const contentType = res.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    } else {
      // Fallback for non-JSON (like 404 HTML pages)
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
  } catch (error) {
    console.error(`[apiClient] Fetch error on ${endpoint}:`, error.message);
    throw error;
  }
};
