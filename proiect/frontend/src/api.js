import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("user");
  if (saved) {
    const user = JSON.parse(saved);
    if (user?.id) {
      config.headers["X-User-ID"] = user.id;
    }
  }
  return config;
});

export default api;
