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
    
    // In a real app, we would save to a database
    const existingMessages = getMessagesFromStorage(message.userId);
    const updatedMessages = [...existingMessages, newMessage];
    
    // Only use localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem(`exitpal-messages-${message.userId}`, JSON.stringify(updatedMessages));
    }
    
    // In a real app, we would schedule the message using a job scheduler
    // For demo purposes, we'll use setTimeout to simulate message sending
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
    
    // Update the message status
    messages.splice(messageIndex, 1);
    
    // Only use localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem(`exitpal-messages-${userId}`, JSON.stringify(messages));
    }
    
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
    
    // Only use localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem(`exitpal-messages-${userId}`, JSON.stringify(messages));
    }
    
    return true;
  } catch (error) {
    console.error("Failed to update message status:", error);
    return false;
  }
};

// Helper function to get messages from localStorage
const getMessagesFromStorage = (userId: string): ScheduledMessage[] => {
  try {
    // Only use localStorage if we're in the browser
    if (typeof window === 'undefined') {
      return [];
    }
    
    const messagesJson = localStorage.getItem(`exitpal-messages-${userId}`);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error("Failed to get messages from storage:", error);
    return [];
  }
};

// Mock function to simulate message sending after the scheduled time
const simulateMessageSending = (message: ScheduledMessage) => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  const scheduledTime = new Date(message.scheduledTime).getTime();
  const currentTime = new Date().getTime();
  const delay = Math.max(0, scheduledTime - currentTime);
  
  setTimeout(() => {
    console.log(`Simulating sending ${message.messageType} to ${message.phoneNumber}`);
    
    // In a real app, we would call Twilio API here
    const success = Math.random() > 0.1; // 90% success rate for simulation
    
    updateMessageStatus(
      message.userId, 
      message.id, 
      success ? 'sent' : 'failed'
    );
  }, delay);
};