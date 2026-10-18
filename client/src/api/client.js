import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskify-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("taskify-token")) {
      localStorage.removeItem("taskify-token");
      window.dispatchEvent(new Event("taskify:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
