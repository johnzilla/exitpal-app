import { supabase, isSupabaseConfigured } from './supabase'
import { sendMessage as sendVonageMessage } from './vonage-service'

export type MessageType = 'sms' | 'voice'
export type MessageStatus = 'pending' | 'sent' | 'failed'

export interface ScheduledMessage {
  id: string
  userId: string
  contactName: string
  messageContent: string
  phoneNumber: string
  scheduledTime: Date
  messageType: MessageType
  status: MessageStatus
  createdAt: Date
  vonageId?: string
}

// Use your actual Vonage number
export const getDefaultVonageNumber = () => "14792659352"

// Mock available premium numbers (you can add more real numbers here if you have them)
export const getAvailableVonageNumbers = () => [
  { id: "1", number: "14792659352", label: "Primary (479)" },
  { id: "2", number: "18005551234", label: "Toll Free (800) - Coming Soon" },
  { id: "3", number: "12125551234", label: "New York (212) - Coming Soon" },
  { id: "4", number: "13105551234", label: "Los Angeles (310) - Coming Soon" },
  { id: "5", number: "13125551234", label: "Chicago (312) - Coming Soon" }
]

// Convert database row to ScheduledMessage
const convertToScheduledMessage = (row: any): ScheduledMessage => ({
  id: row.id,
  userId: row.user_id,
  contactName: row.contact_name,
  messageContent: row.message_content,
  phoneNumber: row.phone_number,
  scheduledTime: new Date(row.scheduled_time),
  messageType: row.message_type,
  status: row.status,
  createdAt: new Date(row.created_at),
  vonageId: row.vonage_id
})

// LocalStorage fallback functions
const getMessagesFromLocalStorage = (userId: string): ScheduledMessage[] => {
  try {
    const stored = localStorage.getItem(`exitpal-messages-${userId}`)
    if (!stored) return []
    
    const messages = JSON.parse(stored)
    return messages.map((msg: any) => ({
      ...msg,
      scheduledTime: new Date(msg.scheduledTime),
      createdAt: new Date(msg.createdAt)
    }))
  } catch (error) {
    console.error('Error loading messages from localStorage:', error)
    return []
  }
}

const saveMessagesToLocalStorage = (userId: string, messages: ScheduledMessage[]) => {
  try {
    localStorage.setItem(`exitpal-messages-${userId}`, JSON.stringify(messages))
  } catch (error) {
    console.error('Error saving messages to localStorage:', error)
  }
}

/**
 * Schedule a new message using Supabase or localStorage fallback
 */
export const scheduleMessage = async (message: Omit<ScheduledMessage, 'id' | 'createdAt'>): Promise<ScheduledMessage> => {
  try {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Using localStorage for message storage (Supabase not configured)')
      
      // Create message with localStorage
      const newMessage: ScheduledMessage = {
        ...message,
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      }
      
      // Get existing messages and add new one
      const existingMessages = getMessagesFromLocalStorage(message.userId)
      const updatedMessages = [...existingMessages, newMessage]
      saveMessagesToLocalStorage(message.userId, updatedMessages)
      
      // Schedule the message sending simulation
      simulateMessageSending(newMessage)
      
      return newMessage
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: message.userId,
        contact_name: message.contactName,
        message_content: message.messageContent,
        phone_number: message.phoneNumber,
        scheduled_time: message.scheduledTime.toISOString(),
        message_type: message.messageType,
        status: message.status
      })
      .select()
      .single()

    if (error) throw error

    const newMessage = convertToScheduledMessage(data)
    
    // Schedule the message sending
    scheduleMessageSending(newMessage)
    
    return newMessage
  } catch (error) {
    console.error("Failed to schedule message:", error)
    throw error
  }
}

/**
 * Get all messages for a user using Supabase or localStorage fallback
 */
export const getMessagesByUserId = async (userId: string): Promise<ScheduledMessage[]> => {
  try {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Using localStorage for message retrieval (Supabase not configured)')
      return getMessagesFromLocalStorage(userId)
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: false })

    if (error) throw error

    return data.map(convertToScheduledMessage)
  } catch (error) {
    console.error("Failed to get messages:", error)
    return []
  }
}

/**
 * Cancel a pending message using Supabase or localStorage fallback
 */
export const cancelMessage = async (userId: string, messageId: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Using localStorage for message cancellation (Supabase not configured)')
      
      const existingMessages = getMessagesFromLocalStorage(userId)
      const updatedMessages = existingMessages.filter(msg => msg.id !== messageId)
      saveMessagesToLocalStorage(userId, updatedMessages)
      
      return true
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId) // Ensure user owns the message

    if (error) throw error
    return true
  } catch (error) {
    console.error("Failed to cancel message:", error)
    return false
  }
}

/**
 * Update message status using Supabase or localStorage fallback
 */
export const updateMessageStatus = async (messageId: string, status: MessageStatus, vonageId?: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Using localStorage for message status update (Supabase not configured)')
      
      // For localStorage, we need to find the message across all users
      // This is a simplified approach for demo purposes
      const keys = Object.keys(localStorage).filter(key => key.startsWith('exitpal-messages-'))
      
      for (const key of keys) {
        try {
          const messages = JSON.parse(localStorage.getItem(key) || '[]')
          const messageIndex = messages.findIndex((msg: any) => msg.id === messageId)
          
          if (messageIndex !== -1) {
            messages[messageIndex].status = status
            if (vonageId) {
              messages[messageIndex].vonageId = vonageId
            }
            localStorage.setItem(key, JSON.stringify(messages))
            return true
          }
        } catch (error) {
          console.error('Error updating message in localStorage:', error)
        }
      }
      
      return false
    }

    const updateData: any = { status }
    if (vonageId) {
      updateData.vonage_id = vonageId
    }

    const { error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', messageId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Failed to update message status:", error)
    return false
  }
}

/**
 * Subscribe to real-time message updates using Supabase or polling fallback
 */
export const subscribeToMessages = (
  userId: string, 
  callback: (messages: ScheduledMessage[]) => void
): (() => void) => {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Using polling for message updates (Supabase not configured)')
    
    // Initial load
    getMessagesByUserId(userId).then(callback)

    // Set up polling every 5 seconds for demo
    const interval = setInterval(() => {
      getMessagesByUserId(userId).then(callback)
    }, 5000)

    // Return cleanup function
    return () => {
      clearInterval(interval)
    }
  }

  // Initial load
  getMessagesByUserId(userId).then(callback)

  // Set up real-time subscription
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${userId}`
      },
      () => {
        // Reload messages when any change occurs
        getMessagesByUserId(userId).then(callback)
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription)
  }
}

/**
 * Schedule message sending using real Vonage integration
 */
const scheduleMessageSending = (message: ScheduledMessage) => {
  const scheduledTime = new Date(message.scheduledTime).getTime()
  const currentTime = new Date().getTime()
  const delay = Math.max(0, scheduledTime - currentTime)
  
  console.log(`📅 Scheduling ${message.messageType} for ${new Date(message.scheduledTime).toLocaleString()}`)
  console.log(`⏰ Delay: ${Math.round(delay / 1000)} seconds`)
  
  setTimeout(async () => {
    console.log(`🚀 Sending ${message.messageType} via Vonage to ${message.phoneNumber}`)
    
    try {
      // Use real Vonage integration
      const result = await sendVonageMessage(
        message.id,
        message.messageType,
        message.phoneNumber,
        message.messageContent
      )
      
      if (result.success) {
        console.log('✅ Message sent successfully via Vonage:', result.vonageId)
        await updateMessageStatus(message.id, 'sent', result.vonageId)
      } else {
        console.error('❌ Message failed:', result.error)
        await updateMessageStatus(message.id, 'failed')
      }
    } catch (error) {
      console.error('💥 Error sending message via Vonage:', error)
      await updateMessageStatus(message.id, 'failed')
    }
  }, delay)
}

/**
 * Mock function to simulate message sending (fallback)
 */
const simulateMessageSending = (message: ScheduledMessage) => {
  const scheduledTime = new Date(message.scheduledTime).getTime()
  const currentTime = new Date().getTime()
  const delay = Math.max(0, scheduledTime - currentTime)
  
  console.log(`📅 [DEMO] Scheduling ${message.messageType} for ${new Date(message.scheduledTime).toLocaleString()}`)
  console.log(`⏰ [DEMO] Delay: ${Math.round(delay / 1000)} seconds`)
  
  setTimeout(async () => {
    console.log(`🎭 [DEMO] Simulating ${message.messageType} to ${message.phoneNumber}`)
    console.log(`📝 [DEMO] Content: "${message.messageContent}"`)
    
    // In a real app, we would call Vonage API here
    const success = Math.random() > 0.1 // 90% success rate for simulation
    
    await updateMessageStatus(
      message.id, 
      success ? 'sent' : 'failed'
    )
    
    if (success) {
      console.log('✅ [DEMO] Message marked as sent')
    } else {
      console.log('❌ [DEMO] Message marked as failed')
    }
  }, delay)
}