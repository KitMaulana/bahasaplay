import { create } from 'zustand';
import api, { initCsrf } from '../lib/axios';

const savedUser = (() => {
    try {
        const raw = localStorage.getItem('bahasa_play_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
})();

export const useAuthStore = create((set) => ({
    user: savedUser,
    isAuthenticated: Boolean(savedUser),
    isLoading: false,

    setAuth: (user, token) => {
        if (token) {
            localStorage.setItem('bahasa_play_token', token);
        }
        if (user) {
            localStorage.setItem('bahasa_play_user', JSON.stringify(user));
        }
        set({ user, isAuthenticated: Boolean(user) });
    },

    setUser: (user) => {
        if (user) {
            localStorage.setItem('bahasa_play_user', JSON.stringify(user));
        }
        set({ user, isAuthenticated: Boolean(user) });
    },

    clearAuth: () => {
        localStorage.removeItem('bahasa_play_token');
        localStorage.removeItem('bahasa_play_user');
        set({ user: null, isAuthenticated: false });
    },

    login: async (identifier, password, role) => {
        set({ isLoading: true });
        try {
            await initCsrf();
            const response = await api.post('/auth/login', { identifier, password, role });
            const { user, token, redirect_to } = response.data.data;
            localStorage.setItem('bahasa_play_token', token);
            localStorage.setItem('bahasa_play_user', JSON.stringify(user));
            set({ user, isAuthenticated: true, isLoading: false });
            return { user, redirect_to };
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // ignore network error on logout
        }
        localStorage.removeItem('bahasa_play_token');
        localStorage.removeItem('bahasa_play_user');
        set({ user: null, isAuthenticated: false });
    },

    fetchMe: async () => {
        try {
            const response = await api.get('/me');
            const user = response.data.data;
            localStorage.setItem('bahasa_play_user', JSON.stringify(user));
            set({ user, isAuthenticated: true });
            return user;
        } catch {
            localStorage.removeItem('bahasa_play_token');
            localStorage.removeItem('bahasa_play_user');
            set({ user: null, isAuthenticated: false });
            return null;
        }
    },
}));
