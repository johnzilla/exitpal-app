// This is a mock service that would normally use Supabase or another database
// For demonstration purposes, we're using localStorage

import { v4 as uuidv4 } from 'uuid';

export type MessageType = 'sms' | 'voice';
export type MessageStatus = 'pending' | 'sent' | 'failed';

export interface ScheduledMessage {
  id: string;
  userId: string;
  contactName: string;
  messageContent: string;
  phoneNumber: string;
  scheduledTime: Date;
  messageType: MessageType;
  status: MessageStatus;
  createdAt: Date;
}

// Mock function to get the Twilio number (would be environment variable in production)
export const getDefaultTwilioNumber = () => "+12312345678";

// Mock available premium numbers
export const getAvailableTwilioNumbers = () => [
  { id: "1", number: "+12313456789", label: "Michigan (231)" },
  { id: "2", number: "+18005551234", label: "Toll Free (800)" },
  { id: "3", number: "+12125551234", label: "New York (212)" },
  { id: "4", number: "+13105551234", label: "Los Angeles (310)" },
  { id: "5", number: "+13125551234", label: "Chicago (312)" }
];

// Save a new message
export const scheduleMessage = async (message: Omit<ScheduledMessage, 'id' | 'createdAt'>) => {
  try {
    const newMessage: ScheduledMessage = {
      ...message,
      id: uuidv4(),
      createdAt: new Date()
    };
    
    // Save to localStorage
    const existingMessages = getMessagesFromStorage(message.userId);
    const updatedMessages = [...existingMessages, newMessage];
    localStorage.setItem(`exitpal-messages-${message.userId}`, JSON.stringify(updatedMessages));
    
    // Simulate message sending with setTimeout
    simulateMessageSending(newMessage);
    
    return newMessage;
  } catch (error) {
    console.error("Failed to schedule message:", error);
    throw error;
  }
};

// Get all messages for a user
export const getMessagesByUserId = (userId: string): ScheduledMessage[] => {
  return getMessagesFromStorage(userId);
};

// Cancel a pending message
export const cancelMessage = (userId: string, messageId: string): boolean => {
  try {
    const messages = getMessagesFromStorage(userId);
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1 || messages[messageIndex].status !== 'pending') {
      return false;
    }
    
    // Remove the message
    messages.splice(messageIndex, 1);
    localStorage.setItem(`exitpal-messages-${userId}`, JSON.stringify(messages));
    
    return true;
  } catch (error) {
    console.error("Failed to cancel message:", error);
    return false;
  }
};

// Update message status
export const updateMessageStatus = (userId: string, messageId: string, status: MessageStatus): boolean => {
  try {
    const messages = getMessagesFromStorage(userId);
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      return false;
    }
    
    // Update the message status
    messages[messageIndex].status = status;
    localStorage.setItem(`exitpal-messages-${userId}`, JSON.stringify(messages));
    
    return true;
  } catch (error) {
    console.error("Failed to update message status:", error);
    return false;
  }
};

// Helper function to get messages from localStorage
const getMessagesFromStorage = (userId: string): ScheduledMessage[] => {
  try {
    if (typeof window === 'undefined') return []; // Handle SSR
    const messagesJson = localStorage.getItem(`exitpal-messages-${userId}`);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error("Failed to get messages from storage:", error);
    return [];
  }
};

// Mock function to simulate message sending after the scheduled time
const simulateMessageSending = (message: ScheduledMessage) => {
  const scheduledTime = new Date(message.scheduledTime).getTime();
  const currentTime = new Date().getTime();
  const delay = Math.max(0, scheduledTime - currentTime);
  
  setTimeout(() => {
    console.log(`Simulating sending ${message.messageType} to ${message.phoneNumber}`);
    
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    
    updateMessageStatus(
      message.userId, 
      message.id, 
      success ? 'sent' : 'failed'
    );
  }, delay);
};

// Mock function to send SMS (for immediate sending)
export const sendSMS = async (
  to: string,
  body: string,
  from: string = getDefaultTwilioNumber()
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log(`[MOCK] Sending SMS from ${from} to ${to}: ${body}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      messageId: `SM${Math.random().toString(36).substring(2, 12)}`,
    };
  } else {
    return {
      success: false,
      error: 'Failed to send SMS. Please try again.',
    };
  }
};

// Mock function to make a voice call (for immediate calling)
export const makeVoiceCall = async (
  to: string,
  message: string,
  from: string = getDefaultTwilioNumber()
): Promise<{ success: boolean; callId?: string; error?: string }> => {
  console.log(`[MOCK] Making voice call from ${from} to ${to} with message: ${message}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      callId: `CA${Math.random().toString(36).substring(2, 12)}`,
    };
  } else {
    return {
      success: false,
      error: 'Failed to make voice call. Please try again.',
    };
  }
};