import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Response interceptor — unwraps the backend's ApiResponse envelope.
 * Backend always returns: { success, status, message, data, timestamp }
 * We transparently expose `data` as `response.data` so hooks don't need to know.
 */
axiosClient.interceptors.response.use(
  (response) => {
    // If the response body has the ApiResponse shape, unwrap it
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
