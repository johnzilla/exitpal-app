// Enhanced storage service that can easily migrate to a real database
import { v4 as uuidv4 } from 'uuid';

export type MessageType = 'sms' | 'voice';
export type MessageStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

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
  updatedAt: Date;
  twilioMessageId?: string;
  fromNumber?: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  isPremium: boolean;
  selectedTwilioNumberId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Storage keys
const USERS_KEY = 'exitpal-users';
const MESSAGES_KEY_PREFIX = 'exitpal-messages-';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Enhanced localStorage wrapper with error handling
class StorageService {
  private getItem(key: string): string | null {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private setItem(key: string, value: string): boolean {
    if (!isBrowser) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  private removeItem(key: string): boolean {
    if (!isBrowser) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  // User operations
  saveUser(user: User): boolean {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...user, updatedAt: new Date() };
    } else {
      users.push({ ...user, updatedAt: new Date() });
    }
    
    return this.setItem(USERS_KEY, JSON.stringify(users));
  }

  getUser(userId: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  private getAllUsers(): User[] {
    const usersJson = this.getItem(USERS_KEY);
    if (!usersJson) return [];
    
    try {
      return JSON.parse(usersJson).map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined
      }));
    } catch (error) {
      console.error('Error parsing users:', error);
      return [];
    }
  }

  // Message operations
  saveMessage(message: ScheduledMessage): boolean {
    const messages = this.getUserMessages(message.userId);
    const existingIndex = messages.findIndex(m => m.id === message.id);
    
    if (existingIndex >= 0) {
      messages[existingIndex] = { ...message, updatedAt: new Date() };
    } else {
      messages.push(message);
    }
    
    return this.setItem(
      `${MESSAGES_KEY_PREFIX}${message.userId}`, 
      JSON.stringify(messages)
    );
  }

  getUserMessages(userId: string): ScheduledMessage[] {
    const messagesJson = this.getItem(`${MESSAGES_KEY_PREFIX}${userId}`);
    if (!messagesJson) return [];
    
    try {
      return JSON.parse(messagesJson).map((message: any) => ({
        ...message,
        scheduledTime: new Date(message.scheduledTime),
        createdAt: new Date(message.createdAt),
        updatedAt: new Date(message.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing messages:', error);
      return [];
    }
  }

  deleteMessage(userId: string, messageId: string): boolean {
    const messages = this.getUserMessages(userId);
    const filteredMessages = messages.filter(m => m.id !== messageId);
    
    return this.setItem(
      `${MESSAGES_KEY_PREFIX}${userId}`, 
      JSON.stringify(filteredMessages)
    );
  }

  updateMessageStatus(
    userId: string, 
    messageId: string, 
    status: MessageStatus,
    twilioMessageId?: string
  ): boolean {
    const messages = this.getUserMessages(userId);
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) return false;
    
    messages[messageIndex] = {
      ...messages[messageIndex],
      status,
      twilioMessageId,
      updatedAt: new Date()
    };
    
    return this.setItem(
      `${MESSAGES_KEY_PREFIX}${userId}`, 
      JSON.stringify(messages)
    );
  }

  // Export data for migration
  exportAllData(): { users: User[], messages: Record<string, ScheduledMessage[]> } {
    const users = this.getAllUsers();
    const messages: Record<string, ScheduledMessage[]> = {};
    
    users.forEach(user => {
      messages[user.id] = this.getUserMessages(user.id);
    });
    
    return { users, messages };
  }

  // Clear all data (for testing)
  clearAllData(): boolean {
    if (!isBrowser) return false;
    
    try {
      const users = this.getAllUsers();
      users.forEach(user => {
        this.removeItem(`${MESSAGES_KEY_PREFIX}${user.id}`);
      });
      this.removeItem(USERS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();

// Helper functions for backward compatibility
export const scheduleMessage = async (
  message: Omit<ScheduledMessage, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ScheduledMessage> => {
  const newMessage: ScheduledMessage = {
    ...message,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const success = storageService.saveMessage(newMessage);
  if (!success) {
    throw new Error('Failed to save message');
  }
  
  // Simulate message sending
  simulateMessageSending(newMessage);
  
  return newMessage;
};

export const getMessagesByUserId = (userId: string): ScheduledMessage[] => {
  return storageService.getUserMessages(userId);
};

export const cancelMessage = (userId: string, messageId: string): boolean => {
  return storageService.deleteMessage(userId, messageId);
};

export const updateMessageStatus = (
  userId: string, 
  messageId: string, 
  status: MessageStatus,
  twilioMessageId?: string
): boolean => {
  return storageService.updateMessageStatus(userId, messageId, status, twilioMessageId);
};

// Twilio number management
export const getDefaultTwilioNumber = () => "+12312345678";

export const getAvailableTwilioNumbers = () => [
  { id: "default", number: "+12312345678", label: "Default ExitPal Number", isPremium: false },
  { id: "michigan", number: "+12313456789", label: "Michigan (231)", isPremium: true },
  { id: "tollfree", number: "+18005551234", label: "Toll Free (800)", isPremium: true },
  { id: "newyork", number: "+12125551234", label: "New York (212)", isPremium: true },
  { id: "losangeles", number: "+13105551234", label: "Los Angeles (310)", isPremium: true },
  { id: "chicago", number: "+13125551234", label: "Chicago (312)", isPremium: true }
];

// Mock message sending simulation
const simulateMessageSending = (message: ScheduledMessage) => {
  const scheduledTime = new Date(message.scheduledTime).getTime();
  const currentTime = new Date().getTime();
  const delay = Math.max(0, scheduledTime - currentTime);
  
  setTimeout(() => {
    console.log(`Simulating sending ${message.messageType} to ${message.phoneNumber}`);
    
    // 90% success rate for simulation
    const success = Math.random() > 0.1;
    
    updateMessageStatus(
      message.userId, 
      message.id, 
      success ? 'sent' : 'failed',
      success ? `${message.messageType.toUpperCase()}${Math.random().toString(36).substring(2, 12)}` : undefined
    );
  }, delay);
};