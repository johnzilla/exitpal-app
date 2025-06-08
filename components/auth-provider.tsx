"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  phone?: string;
  isPremium: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    const storedUser = localStorage.getItem("exitpal-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // For demo purposes, we're using localStorage to simulate authentication
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, we would validate with a backend here
      const mockUser = {
        id: "user-" + Date.now(),
        email,
        phone: "",
        isPremium: false
      };
      
      // Only use localStorage if we're in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem("exitpal-user", JSON.stringify(mockUser));
      }
      setUser(mockUser);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      // In a real app, we would create an account with a backend here
      const mockUser = {
        id: "user-" + Date.now(),
        email,
        phone: phone || "",
        isPremium: false
      };
      
      // Only use localStorage if we're in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem("exitpal-user", JSON.stringify(mockUser));
      }
      setUser(mockUser);
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Mock Google sign-in
      const mockUser = {
        id: "google-user-" + Date.now(),
        email: "user@gmail.com",
        phone: "",
        isPremium: false
      };
      
      // Only use localStorage if we're in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem("exitpal-user", JSON.stringify(mockUser));
      }
      setUser(mockUser);
      router.push("/dashboard");
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Only use localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem("exitpal-user");
    }
    setUser(null);
    router.push("/");
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    
    // Only use localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem("exitpal-user", JSON.stringify(updatedUser));
    }
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, signInWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};