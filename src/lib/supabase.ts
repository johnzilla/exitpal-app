import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Environment check:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET',
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Using demo mode.')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const configured = !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key' &&
    supabaseUrl.includes('supabase.co')
  )
  
  console.log('🔍 Supabase configuration check:', {
    configured,
    url: supabaseUrl,
    hasValidUrl: supabaseUrl && supabaseUrl.includes('supabase.co'),
    hasValidKey: supabaseAnonKey && supabaseAnonKey !== 'placeholder-key'
  })
  
  return configured
}

// Helper to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      return false
    }
    console.log('✅ Supabase connection test successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection test error:', error)
    return false
  }
}