import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configure axios defaults for CORS
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

// Request interceptor — always attach the latest token from localStorage
axios.interceptors.request.use(
  (config) => {
    // Skip auth header for token refresh to avoid sending an expired token
    if (config.url && config.url.includes('/auth/refresh')) {
      return config;
    }
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true, // Send refresh token cookie
          }
        );

        const { accessToken } = response.data;

        // Save new access token (use localStorage to match AuthContext)
        localStorage.setItem('accessToken', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Notify AuthContext of the refreshed token
        window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: { accessToken } }));

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear session and redirect to login
        processQueue(refreshError, null);
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        
        // Dispatch event to trigger logout UI
        window.dispatchEvent(new Event('sessionExpired'));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
