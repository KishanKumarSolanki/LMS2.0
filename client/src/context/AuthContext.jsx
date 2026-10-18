/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { loginRequest, registerRequest, googleLoginRequest } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('lms_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const loading = false;

    const login = async (email, password) => {
        try {
            const result = await loginRequest(email, password);
            setUser(result.user);
            localStorage.setItem('lms_user', JSON.stringify(result.user));
            localStorage.setItem('lms_token', result.token);
            return { success: true, role: result.user.role };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (payload) => {
        try {
            const result = await registerRequest(payload);
            setUser(result.user);
            localStorage.setItem('lms_user', JSON.stringify(result.user));
            localStorage.setItem('lms_token', result.token);
            return { success: true, role: result.user.role };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const googleLogin = async (credential) => {
        try {
            const result = await googleLoginRequest(credential);
            setUser(result.user);
            localStorage.setItem('lms_user', JSON.stringify(result.user));
            localStorage.setItem('lms_token', result.token);
            return { success: true, role: result.user.role };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lms_user');
        localStorage.removeItem('lms_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
