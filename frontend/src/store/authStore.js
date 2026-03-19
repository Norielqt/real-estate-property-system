import { create } from 'zustand';
import { authApi } from '../api/index.js';

const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem('token') || null,
  loading: false,

  setUser: (user) => set({ user }),

  login: async (credentials) => {
    set({ loading: true });
    const { data } = await authApi.login(credentials);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, loading: false });
    return data;
  },

  register: async (formData) => {
    set({ loading: true });
    const { data } = await authApi.register(formData);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, loading: false });
    return data;
  },

  logout: async () => {
    try { await authApi.logout(); } catch (_) {}
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const { data } = await authApi.me();
      set({ user: data });
    } catch (_) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));

export default useAuthStore;
