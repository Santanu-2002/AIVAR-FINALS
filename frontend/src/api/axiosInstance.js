import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://aivar-backend-d0w4.onrender.com",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("aivar_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;