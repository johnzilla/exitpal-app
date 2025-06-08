"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storageService, type User } from "@/lib/storage-service";
import { v4 as uuidv4 } from 'uuid';

type AuthUser = {
  id: string;
  email: string;
  phone?: string;
  isPremium: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Convert storage User to AuthUser
  const convertToAuthUser = (storageUser: User): AuthUser => ({
    id: storageUser.id,
    email: storageUser.email,
    phone: storageUser.phone,
    isPremium: storageUser.isPremium,
  });

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUserId = sessionStorage.getItem("exitpal-current-user");
        if (currentUserId) {
          const storageUser = storageService.getUser(currentUserId);
          if (storageUser) {
            setUser(convertToAuthUser(storageUser));
          } else {
            // Clean up invalid session
            sessionStorage.removeItem("exitpal-current-user");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, we would validate credentials with a backend
      const existingUser = storageService.getUserByEmail(email);
      
      if (!existingUser) {
        throw new Error("User not found");
      }
      
      // Set session
      sessionStorage.setItem("exitpal-current-user", existingUser.id);
      setUser(convertToAuthUser(existingUser));
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
      // Check if user already exists
      const existingUser = storageService.getUserByEmail(email);
      if (existingUser) {
        throw new Error("User already exists");
      }
      
      // Create new user
      const newUser: User = {
        id: uuidv4(),
        email,
        phone: phone || undefined,
        isPremium: false,
        createdAt: new Date(),
      };
      
      const success = storageService.saveUser(newUser);
      if (!success) {
        throw new Error("Failed to create user");
      }
      
      // Set session
      sessionStorage.setItem("exitpal-current-user", newUser.id);
      setUser(convertToAuthUser(newUser));
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
      // Mock Google sign-in - create a demo user
      const mockEmail = `demo-${Date.now()}@gmail.com`;
      const newUser: User = {
        id: uuidv4(),
        email: mockEmail,
        phone: undefined,
        isPremium: false,
        createdAt: new Date(),
      };
      
      const success = storageService.saveUser(newUser);
      if (!success) {
        throw new Error("Failed to create user");
      }
      
      // Set session
      sessionStorage.setItem("exitpal-current-user", newUser.id);
      setUser(convertToAuthUser(newUser));
      router.push("/dashboard");
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("exitpal-current-user");
    setUser(null);
    router.push("/");
  };

  const updateUser = async (userData: Partial<AuthUser>) => {
    if (!user) return;
    
    try {
      const currentStorageUser = storageService.getUser(user.id);
      if (!currentStorageUser) {
        throw new Error("User not found");
      }
      
      const updatedUser: User = {
        ...currentStorageUser,
        ...userData,
      };
      
      const success = storageService.saveUser(updatedUser);
      if (!success) {
        throw new Error("Failed to update user");
      }
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signUp, 
      signInWithGoogle, 
      logout, 
      updateUser 
    }}>
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