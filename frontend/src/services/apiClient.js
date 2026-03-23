/**
 * Low-level API Client for reusable fetch calls.
 * @param {string} url - The URL endpoint to call.
 * @param {object} options - Optional fetch configuration.
 * @returns {Promise<any>} - The JSON response from the server.
 */
export const apiClient = async (url, options = {}) => {
  try {
    // Perform fetch request using provided URL and options
    const res = await fetch(url, options);
    
    // Check if the response status is not successful
    if (!res.ok) {
      throw new Error(`Endpoint error: ${res.status}`);
    }
    
    // Parse the JSON data from the response body
    const data = await res.json();
    return data;
  } catch (error) {
    // Log and re-throw error for higher-level handling
    console.error("[apiClient] Fetch error:", error.message);
    throw error;
  }
};
