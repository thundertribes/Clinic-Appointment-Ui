"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
//import { User } from '@/type';

// Defines the Shape of your user object for TypeScript
interface User {
    internal_user_id: number;
    client_id: number;
    name: string;
    email: string;
    role: string;
    phoneNumber: string;
    location: string;
    is_active: boolean;
    created_at: string;
    department: string;
    twoFactorEnabled: boolean;
    lastPasswordChangeDate: string | null;
}

// Shape of the data and functions our context will provide
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, userToken: string) => void;
    logout: () => void;
    refreshUser: (newUserData: User) => void;
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const login = (userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };
    const refreshUser = (newUserData: User) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    // This checks if a user was already logged in when the app loads
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to load user from localStorage", error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook to make it easy for components to use the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};