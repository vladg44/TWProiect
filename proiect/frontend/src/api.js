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

// Interceptor pentru a gestiona erorile de autentificare
api.interceptors.response.use(
  (response) => response, // Daca e ok, nu facem nimic
  (error) => {
    // Daca primim 401, si NU suntem la login, inseamna ca sesiunea a expirat
    if (error.response && error.response.status === 401 && !error.config.url.endsWith('/auth/login')) {
      console.warn("Sesiune invalida. Se curata localStorage si se reincarca.");
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

export default api;
