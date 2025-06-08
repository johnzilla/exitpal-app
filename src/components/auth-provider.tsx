import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

type User = {
  id: string
  email: string
  phone?: string
  isPremium: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, phone?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check if user is logged in on initial load
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔧 Checking Supabase configuration...')
      console.log('🔧 Supabase configured:', isSupabaseConfigured())
      
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, using localStorage fallback')
        // Check localStorage for demo user
        const storedUser = localStorage.getItem("exitpal-user")
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            console.log('✅ Loaded user from localStorage:', parsedUser)
          } catch (error) {
            console.error('❌ Error parsing stored user:', error)
            localStorage.removeItem("exitpal-user")
          }
        }
        setLoading(false)
        return
      }

      // Get initial session from Supabase
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Error getting session:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Only set up auth listener if Supabase is configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔍 Loading user profile for:', supabaseUser.id)
      
      // Try to get existing profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      console.log('📊 Profile query result:', { profile, error })

      // If profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        console.log('👤 Creating new profile for user:', supabaseUser.id)
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            phone: null,
            is_premium: false
          })
          .select()
          .single()

        console.log('✅ Profile creation result:', { newProfile, insertError })

        if (insertError) {
          console.error('❌ Profile creation failed:', insertError)
          throw insertError
        }
        profile = newProfile
      } else if (error) {
        console.error('❌ Profile query failed:', error)
        throw error
      }

      if (profile) {
        console.log('✅ User profile loaded successfully:', profile)
        setUser({
          id: profile.id,
          email: profile.email,
          phone: profile.phone || undefined,
          isPremium: profile.is_premium
        })
      }
    } catch (error) {
      console.error('💥 Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    console.log('🔐 Attempting login for:', email)
    
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Using demo login (Supabase not configured)')
        // Demo login - simulate successful authentication
        const mockUser = {
          id: "demo-user-" + Date.now(),
          email,
          phone: "",
          isPremium: false
        }
        
        localStorage.setItem("exitpal-user", JSON.stringify(mockUser))
        setUser(mockUser)
        navigate('/dashboard')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Login failed:', error)
        throw error
      }
      
      console.log('✅ Login successful')
      navigate('/dashboard')
    } catch (error) {
      console.error('💥 Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, phone?: string) => {
    setLoading(true)
    console.log('📝 Attempting signup for:', email, 'with phone:', phone)
    
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Using demo signup (Supabase not configured)')
        // Demo signup - simulate successful registration
        const mockUser = {
          id: "demo-user-" + Date.now(),
          email,
          phone: phone || "",
          isPremium: false
        }
        
        localStorage.setItem("exitpal-user", JSON.stringify(mockUser))
        setUser(mockUser)
        navigate('/dashboard')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: phone || null
          }
        }
      })
      
      console.log('📊 Signup result:', { data, error })
      
      if (error) {
        console.error('❌ Signup failed:', error)
        throw error
      }
      
      console.log('✅ Signup successful:', data)
      navigate('/dashboard')
    } catch (error) {
      console.error('💥 Signup error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    console.log('🔍 Attempting Google sign-in')
    
    try {
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Using demo Google sign-in (Supabase not configured)')
        // Demo Google sign-in
        const mockUser = {
          id: "google-demo-user-" + Date.now(),
          email: "demo@gmail.com",
          phone: "",
          isPremium: false
        }
        
        localStorage.setItem("exitpal-user", JSON.stringify(mockUser))
        setUser(mockUser)
        navigate('/dashboard')
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        console.error('❌ Google sign-in failed:', error)
        throw error
      }
      
      console.log('✅ Google sign-in initiated')
    } catch (error) {
      console.error('💥 Google sign-in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    console.log('🚪 Logging out user')
    
    if (!isSupabaseConfigured()) {
      // Demo logout
      localStorage.removeItem("exitpal-user")
      setUser(null)
      navigate('/')
      return
    }

    await supabase.auth.signOut()
    setUser(null)
    navigate('/')
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return
    
    console.log('🔄 Updating user:', userData)
    
    try {
      if (!isSupabaseConfigured()) {
        // Demo update
        const updatedUser = { ...user, ...userData }
        localStorage.setItem("exitpal-user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          phone: userData.phone,
          is_premium: userData.isPremium
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ User update failed:', error)
        throw error
      }

      console.log('✅ User updated successfully')
      setUser({ ...user, ...userData })
    } catch (error) {
      console.error('💥 Error updating user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, signInWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}