import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bahasa_play_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function initCsrf() {
    try {
        await axios.get('/sanctum/csrf-cookie', {
            withCredentials: true,
        });
    } catch {
        // Fallback to token auth if cross-origin IP
    }
}

export default api;
