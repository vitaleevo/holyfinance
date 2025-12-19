"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
    id: Id<"users">;
    name: string;
    email: string;
    avatarUrl?: string | null;
    familyRelationship?: string | null;
}

interface AuthContextType {
    user: User | null;
    userId: Id<"users"> | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "holyfinancas_token";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            setToken(savedToken);
        }
        setIsLoading(false);
    }, []);

    // Get current user from token
    const currentUser = useQuery(api.auth.getCurrentUser, { token: token ?? undefined });

    // Mutations
    const loginMutation = useMutation(api.auth.login);
    const registerMutation = useMutation(api.auth.register);
    const logoutMutation = useMutation(api.auth.logout);

    const user: User | null = currentUser ? {
        id: currentUser.id as Id<"users">,
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
        familyRelationship: currentUser.familyRelationship,
    } : null;

    const login = async (email: string, password: string) => {
        try {
            const result = await loginMutation({ email, password });
            localStorage.setItem(TOKEN_KEY, result.token);
            setToken(result.token);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro ao fazer login";
            throw new Error(message);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const result = await registerMutation({ name, email, password });
            localStorage.setItem(TOKEN_KEY, result.token);
            setToken(result.token);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro ao criar conta";
            throw new Error(message);
        }
    };

    const logout = async () => {
        if (token) {
            try {
                await logoutMutation({ token });
            } catch (e) {
                // Ignore logout errors
            }
        }
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userId: user?.id ?? null,
            token,
            isLoading: isLoading || currentUser === undefined,
            isAuthenticated: !!user,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
