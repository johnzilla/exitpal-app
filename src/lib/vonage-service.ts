import { supabase } from './supabase'

export type MessageType = 'sms' | 'voice'

/**
 * Send a message via Vonage using Supabase Edge Function
 * This keeps API keys secure and implements rate limiting
 */
export const sendMessage = async (
  messageId: string,
  type: MessageType,
  to: string,
  content: string,
  fromNumber?: string
): Promise<{ success: boolean; vonageId?: string; error?: string }> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    // Call the Supabase Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-message`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          to,
          content,
          type,
          fromNumber,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send message')
    }

    return {
      success: true,
      vonageId: result.vonageId,
    }

  } catch (error) {
    console.error('Vonage service error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get daily usage for the current user
 */
export const getDailyUsage = async (): Promise<{ count: number; limit: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { count: 0, limit: 0 }
    }

    // Get user profile to check premium status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    const limit = profile?.is_premium ? 50 : 3

    // Get today's sent messages
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'sent')
      .gte('created_at', today.toISOString())

    return {
      count: messages?.length || 0,
      limit,
    }

  } catch (error) {
    console.error('Error getting daily usage:', error)
    return { count: 0, limit: 0 }
  }
}

// Mock functions for development/fallback
export const sendSMS = async (
  to: string,
  text: string,
  from?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log(`[MOCK] Sending SMS via Vonage from ${from} to ${to}: ${text}`)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      messageId: `vonage-${Math.random().toString(36).substring(2, 12)}`,
    }
  } else {
    return {
      success: false,
      error: 'Failed to send SMS via Vonage. Please try again.',
    }
  }
}

export const makeVoiceCall = async (
  to: string,
  message: string,
  from?: string
): Promise<{ success: boolean; callId?: string; error?: string }> => {
  console.log(`[MOCK] Making voice call via Vonage from ${from} to ${to} with message: ${message}`)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      callId: `vonage-call-${Math.random().toString(36).substring(2, 12)}`,
    }
  } else {
    return {
      success: false,
      error: 'Failed to make voice call via Vonage. Please try again.',
    }
  }
}