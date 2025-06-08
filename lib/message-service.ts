// Updated message service using Firebase Firestore
import { v4 as uuidv4 } from 'uuid';
import { 
  saveMessage, 
  getUserMessages, 
  deleteMessage, 
  updateMessageStatus as updateFirestoreMessageStatus,
  subscribeToUserMessages 
} from './firebase-service';

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

/**
 * Schedule a new message using Firestore
 */
export const scheduleMessage = async (message: Omit<ScheduledMessage, 'id' | 'createdAt'>): Promise<ScheduledMessage> => {
  try {
    // Save to Firestore
    const newMessage = await saveMessage(message);
    
    // Schedule the message sending simulation
    simulateMessageSending(newMessage);
    
    return newMessage;
  } catch (error) {
    console.error("Failed to schedule message:", error);
    throw error;
  }
};

/**
 * Get all messages for a user using Firestore
 */
export const getMessagesByUserId = async (userId: string): Promise<ScheduledMessage[]> => {
  try {
    return await getUserMessages(userId);
  } catch (error) {
    console.error("Failed to get messages:", error);
    return [];
  }
};

/**
 * Cancel a pending message using Firestore
 */
export const cancelMessage = async (userId: string, messageId: string): Promise<boolean> => {
  try {
    // In a real app, you'd validate ownership here
    // For now, we'll trust the userId parameter
    return await deleteMessage(messageId);
  } catch (error) {
    console.error("Failed to cancel message:", error);
    return false;
  }
};

/**
 * Update message status using Firestore
 */
export const updateMessageStatus = async (messageId: string, status: MessageStatus): Promise<boolean> => {
  try {
    return await updateFirestoreMessageStatus(messageId, status);
  } catch (error) {
    console.error("Failed to update message status:", error);
    return false;
  }
};

/**
 * Subscribe to real-time message updates
 * This is a new feature enabled by Firestore!
 */
export const subscribeToMessages = (
  userId: string, 
  callback: (messages: ScheduledMessage[]) => void
): (() => void) => {
  return subscribeToUserMessages(userId, callback);
};

/**
 * Mock function to simulate message sending after the scheduled time
 * In production, this would be handled by a server-side job scheduler
 */
const simulateMessageSending = (message: ScheduledMessage) => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  const scheduledTime = new Date(message.scheduledTime).getTime();
  const currentTime = new Date().getTime();
  const delay = Math.max(0, scheduledTime - currentTime);
  
  setTimeout(async () => {
    console.log(`Simulating sending ${message.messageType} to ${message.phoneNumber}`);
    
    // In a real app, we would call Twilio API here
    const success = Math.random() > 0.1; // 90% success rate for simulation
    
    await updateMessageStatus(
      message.id, 
      success ? 'sent' : 'failed'
    );
  }, delay);
};

// Legacy functions for backward compatibility
// These maintain the same interface but now use Firestore

/**
 * @deprecated Use getMessagesByUserId instead
 */
export const getMessagesFromStorage = async (userId: string): Promise<ScheduledMessage[]> => {
  console.warn('getMessagesFromStorage is deprecated. Use getMessagesByUserId instead.');
  return getMessagesByUserId(userId);
};