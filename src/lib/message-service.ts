import { supabase } from './supabase'

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
}

// Mock function to get the Twilio number (would be environment variable in production)
export const getDefaultTwilioNumber = () => "+12312345678"

// Mock available premium numbers
export const getAvailableTwilioNumbers = () => [
  { id: "1", number: "+12313456789", label: "Michigan (231)" },
  { id: "2", number: "+18005551234", label: "Toll Free (800)" },
  { id: "3", number: "+12125551234", label: "New York (212)" },
  { id: "4", number: "+13105551234", label: "Los Angeles (310)" },
  { id: "5", number: "+13125551234", label: "Chicago (312)" }
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
  createdAt: new Date(row.created_at)
})

/**
 * Schedule a new message using Supabase
 */
export const scheduleMessage = async (message: Omit<ScheduledMessage, 'id' | 'createdAt'>): Promise<ScheduledMessage> => {
  try {
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
    
    // Schedule the message sending simulation
    simulateMessageSending(newMessage)
    
    return newMessage
  } catch (error) {
    console.error("Failed to schedule message:", error)
    throw error
  }
}

/**
 * Get all messages for a user using Supabase
 */
export const getMessagesByUserId = async (userId: string): Promise<ScheduledMessage[]> => {
  try {
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
 * Cancel a pending message using Supabase
 */
export const cancelMessage = async (userId: string, messageId: string): Promise<boolean> => {
  try {
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
 * Update message status using Supabase
 */
export const updateMessageStatus = async (messageId: string, status: MessageStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', messageId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Failed to update message status:", error)
    return false
  }
}

/**
 * Subscribe to real-time message updates using Supabase
 */
export const subscribeToMessages = (
  userId: string, 
  callback: (messages: ScheduledMessage[]) => void
): (() => void) => {
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
 * Mock function to simulate message sending after the scheduled time
 */
const simulateMessageSending = (message: ScheduledMessage) => {
  const scheduledTime = new Date(message.scheduledTime).getTime()
  const currentTime = new Date().getTime()
  const delay = Math.max(0, scheduledTime - currentTime)
  
  setTimeout(async () => {
    console.log(`Simulating sending ${message.messageType} to ${message.phoneNumber}`)
    
    // In a real app, we would call Twilio API here
    const success = Math.random() > 0.1 // 90% success rate for simulation
    
    await updateMessageStatus(
      message.id, 
      success ? 'sent' : 'failed'
    )
  }, delay)
}