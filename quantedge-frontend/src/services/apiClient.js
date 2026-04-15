import axios from 'axios';

// This file will handle Axios requests to the backend API
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add the standard JWT
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const apiClient = {
    login: async (credentials) => {
        return axiosInstance.post('/auth/login', credentials);
    },
    register: async (credentials) => {
        return axiosInstance.post('/auth/register', credentials);
    },
    getPrices: async (symbol) => {
        // use axios
        const response = await axiosInstance.get(`/market/prices/${symbol}`);
        return response.data;
    }
};

export default axiosInstance;
