// Firebase Firestore service with fallback to localStorage
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from './firebase';
import { MessageType, MessageStatus, ScheduledMessage } from './message-service';
import { v4 as uuidv4 } from 'uuid';

// Collection names
const MESSAGES_COLLECTION = 'messages';

// Fallback localStorage functions
const getLocalStorageKey = (userId: string) => `exitpal-messages-${userId}`;

const getMessagesFromLocalStorage = (userId: string): ScheduledMessage[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(getLocalStorageKey(userId));
    return stored ? JSON.parse(stored).map((msg: any) => ({
      ...msg,
      scheduledTime: new Date(msg.scheduledTime),
      createdAt: new Date(msg.createdAt)
    })) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveMessagesToLocalStorage = (userId: string, messages: ScheduledMessage[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// Convert ScheduledMessage for Firestore
const prepareMessageForFirestore = (message: Omit<ScheduledMessage, 'id' | 'createdAt'>) => {
  return {
    ...message,
    scheduledTime: Timestamp.fromDate(new Date(message.scheduledTime)),
    createdAt: serverTimestamp()
  };
};

// Convert Firestore document to ScheduledMessage
const convertFirestoreMessage = (doc: any): ScheduledMessage => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    contactName: data.contactName,
    messageContent: data.messageContent,
    phoneNumber: data.phoneNumber,
    scheduledTime: convertTimestamp(data.scheduledTime),
    messageType: data.messageType,
    status: data.status,
    createdAt: convertTimestamp(data.createdAt)
  };
};

/**
 * Save a new scheduled message (Firebase or localStorage fallback)
 */
export const saveMessage = async (message: Omit<ScheduledMessage, 'id' | 'createdAt'>): Promise<ScheduledMessage> => {
  const newMessage: ScheduledMessage = {
    id: uuidv4(),
    ...message,
    createdAt: new Date()
  };

  if (isFirebaseAvailable()) {
    try {
      const messageData = prepareMessageForFirestore(message);
      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
      return { ...newMessage, id: docRef.id };
    } catch (error) {
      console.warn('Firebase save failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const existingMessages = getMessagesFromLocalStorage(message.userId);
  const updatedMessages = [...existingMessages, newMessage];
  saveMessagesToLocalStorage(message.userId, updatedMessages);
  
  return newMessage;
};

/**
 * Get all messages for a specific user (Firebase or localStorage fallback)
 */
export const getUserMessages = async (userId: string): Promise<ScheduledMessage[]> => {
  if (isFirebaseAvailable()) {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('userId', '==', userId),
        orderBy('scheduledTime', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const messages: ScheduledMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        messages.push(convertFirestoreMessage(doc));
      });
      
      return messages;
    } catch (error) {
      console.warn('Firebase get failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  return getMessagesFromLocalStorage(userId);
};

/**
 * Delete a message (Firebase or localStorage fallback)
 */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  if (isFirebaseAvailable()) {
    try {
      await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
      return true;
    } catch (error) {
      console.warn('Firebase delete failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage - we need userId for this
  // For now, we'll search through all possible user storage
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('exitpal-messages-')) {
          const messages = JSON.parse(localStorage.getItem(key) || '[]');
          const filteredMessages = messages.filter((msg: any) => msg.id !== messageId);
          if (filteredMessages.length !== messages.length) {
            localStorage.setItem(key, JSON.stringify(filteredMessages));
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }

  return false;
};

/**
 * Update message status (Firebase or localStorage fallback)
 */
export const updateMessageStatus = async (messageId: string, status: MessageStatus): Promise<boolean> => {
  if (isFirebaseAvailable()) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, { status });
      return true;
    } catch (error) {
      console.warn('Firebase update failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('exitpal-messages-')) {
          const messages = JSON.parse(localStorage.getItem(key) || '[]');
          const updatedMessages = messages.map((msg: any) => 
            msg.id === messageId ? { ...msg, status } : msg
          );
          if (JSON.stringify(messages) !== JSON.stringify(updatedMessages)) {
            localStorage.setItem(key, JSON.stringify(updatedMessages));
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }

  return false;
};

/**
 * Real-time listener for user messages (Firebase or polling fallback)
 */
export const subscribeToUserMessages = (
  userId: string, 
  callback: (messages: ScheduledMessage[]) => void
): (() => void) => {
  if (isFirebaseAvailable()) {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('userId', '==', userId),
        orderBy('scheduledTime', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: ScheduledMessage[] = [];
        querySnapshot.forEach((doc) => {
          messages.push(convertFirestoreMessage(doc));
        });
        callback(messages);
      }, (error) => {
        console.error('Error in real-time listener:', error);
        // Fall back to localStorage
        fallbackToPolling();
      });
      
      return unsubscribe;
    } catch (error) {
      console.warn('Firebase subscription failed, falling back to polling:', error);
    }
  }

  // Fallback to polling localStorage
  function fallbackToPolling() {
    let lastMessages = JSON.stringify([]);
    
    const poll = () => {
      const messages = getMessagesFromLocalStorage(userId);
      const currentMessages = JSON.stringify(messages);
      
      if (currentMessages !== lastMessages) {
        lastMessages = currentMessages;
        callback(messages);
      }
    };
    
    // Initial load
    poll();
    
    // Poll every 2 seconds
    const interval = setInterval(poll, 2000);
    
    return () => clearInterval(interval);
  }

  return fallbackToPolling();
};

/**
 * Security validation (Firebase only)
 */
export const validateMessageOwnership = async (messageId: string, userId: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    return true; // Skip validation for localStorage fallback
  }

  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    let isOwner = false;
    
    querySnapshot.forEach((doc) => {
      if (doc.id === messageId) {
        isOwner = true;
      }
    });
    
    return isOwner;
  } catch (error) {
    console.error('Error validating message ownership:', error);
    return false;
  }
};