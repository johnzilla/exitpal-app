"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProfile, updateProfile } from "@/lib/database-service";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase";

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

  // Convert Supabase user + profile to our AuthUser type
  const createAuthUser = (supabaseUser: User, profile: Profile): AuthUser => ({
    id: supabaseUser.id,
    email: supabaseUser.email!,
    phone: profile.phone,
    isPremium: profile.is_premium,
  });

  // Check if user is logged in on initial load
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setUser(createAuthUser(session.user, profile));
        }
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUser(createAuthUser(session.user, profile));
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await getProfile(data.user.id);
        if (profile) {
          setUser(createAuthUser(data.user, profile));
          router.push("/dashboard");
        }
      }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: phone || '',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Profile will be created automatically by the trigger
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const profile = await getProfile(data.user.id);
        if (profile) {
          setUser(createAuthUser(data.user, profile));
          router.push("/dashboard");
        }
      }
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const updateUser = async (userData: Partial<AuthUser>) => {
    if (!user) return;
    
    try {
      // Update profile in database
      const profileUpdates: Partial<Profile> = {};
      if (userData.phone !== undefined) profileUpdates.phone = userData.phone;
      if (userData.isPremium !== undefined) profileUpdates.is_premium = userData.isPremium;
      
      const success = await updateProfile(user.id, profileUpdates);
      
      if (success) {
        // Update local state
        setUser(prev => prev ? { ...prev, ...userData } : null);
      }
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