import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000,
  // Don't set a default Content-Type so that it can be set automatically for multipart/form-data
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      // Add Authorization header
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Allow Content-Type to be set automatically for multipart/form-data
    // This will ensure the browser sets the correct boundary parameter
    return config; // Proceed with the modified config
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
