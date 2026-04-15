import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            const email = localStorage.getItem('email');
            if (email) setUser({ email });
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await apiClient.login({ email, password });
            if (response.data.token) {
                setToken(response.data.token);
                setUser({ email: response.data.email });
                localStorage.setItem('email', response.data.email);
                return true;
            }
        } catch (error) {
            console.error("Login Error", error);
            throw error;
        }
        return false;
    };

    const register = async (email, password) => {
        try {
            const response = await apiClient.register({ email, password });
            if (response.data.token) {
                setToken(response.data.token);
                setUser({ email: response.data.email });
                localStorage.setItem('email', response.data.email);
                return true;
            }
        } catch (error) {
            console.error("Register Error", error);
            throw error;
        }
        return false;
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
