import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: { 'Accept': 'application/json' },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ---------- Auth ----------
export const authApi = {
  register: (data) => api.post('/register', data),
  login:    (data) => api.post('/login', data),
  logout:   ()     => api.post('/logout'),
  me:       ()     => api.get('/me'),
};

// ---------- Properties ----------
export const propertiesApi = {
  list:        (params) => api.get('/properties', { params }),
  publicList:  (params) => api.get('/properties/public', { params }),
  get:         (id)     => api.get(`/properties/${id}`),
  create:      (data)   => api.post('/properties', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, data) => api.post(`/properties/${id}?_method=PUT`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)       => api.delete(`/properties/${id}`),
  myListings:  (params)   => api.get('/my-listings', { params }),
  deleteImage: (imageId)  => api.delete(`/property-images/${imageId}`),
};

// ---------- Favorites ----------
export const favoritesApi = {
  list:   ()           => api.get('/favorites'),
  toggle: (propertyId) => api.post(`/favorites/${propertyId}`),
};

// ---------- Bookings ----------
export const bookingsApi = {
  create:       (propertyId, data) => api.post(`/properties/${propertyId}/bookings`, data),
  myBookings:   (params)           => api.get('/my-bookings', { params }),
  ownerBookings:(params)           => api.get('/owner-bookings', { params }),
  updateStatus: (id, status)       => api.put(`/bookings/${id}/status`, { status }),
  get:          (id)               => api.get(`/bookings/${id}`),
};
