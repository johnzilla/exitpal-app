// Firebase Firestore service with localStorage fallback for static exports
import { MessageType, MessageStatus, ScheduledMessage } from './message-service';
import { v4 as uuidv4 } from 'uuid';

// Firebase will only be available in development/runtime, not during build
let firestoreOperations: any = null;

// Initialize Firestore operations dynamically
const initFirestore = async () => {
  if (typeof window === 'undefined' || firestoreOperations) {
    return firestoreOperations;
  }

  try {
    const { isFirebaseAvailable, db } = await import('./firebase');
    
    if (!isFirebaseAvailable() || !db) {
      return null;
    }

    const {
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
    } = await import('firebase/firestore');

    firestoreOperations = {
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
      Timestamp,
      db
    };

    return firestoreOperations;
  } catch (error) {
    console.warn('Firestore operations not available:', error);
    return null;
  }
};

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
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// Convert ScheduledMessage for Firestore
const prepareMessageForFirestore = (message: Omit<ScheduledMessage, 'id' | 'createdAt'>, ops: any) => {
  return {
    ...message,
    scheduledTime: ops.Timestamp.fromDate(new Date(message.scheduledTime)),
    createdAt: ops.serverTimestamp()
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

  const ops = await initFirestore();
  
  if (ops) {
    try {
      const messageData = prepareMessageForFirestore(message, ops);
      const docRef = await ops.addDoc(ops.collection(ops.db, MESSAGES_COLLECTION), messageData);
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
  const ops = await initFirestore();
  
  if (ops) {
    try {
      const q = ops.query(
        ops.collection(ops.db, MESSAGES_COLLECTION),
        ops.where('userId', '==', userId),
        ops.orderBy('scheduledTime', 'desc')
      );
      
      const querySnapshot = await ops.getDocs(q);
      const messages: ScheduledMessage[] = [];
      
      querySnapshot.forEach((doc: any) => {
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
  const ops = await initFirestore();
  
  if (ops) {
    try {
      await ops.deleteDoc(ops.doc(ops.db, MESSAGES_COLLECTION, messageId));
      return true;
    } catch (error) {
      console.warn('Firebase delete failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage - search through all possible user storage
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
  const ops = await initFirestore();
  
  if (ops) {
    try {
      const messageRef = ops.doc(ops.db, MESSAGES_COLLECTION, messageId);
      await ops.updateDoc(messageRef, { status });
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
  // Try Firebase real-time listener
  initFirestore().then(ops => {
    if (ops) {
      try {
        const q = ops.query(
          ops.collection(ops.db, MESSAGES_COLLECTION),
          ops.where('userId', '==', userId),
          ops.orderBy('scheduledTime', 'desc')
        );
        
        const unsubscribe = ops.onSnapshot(q, (querySnapshot: any) => {
          const messages: ScheduledMessage[] = [];
          querySnapshot.forEach((doc: any) => {
            messages.push(convertFirestoreMessage(doc));
          });
          callback(messages);
        }, (error: any) => {
          console.error('Error in real-time listener:', error);
          // Fall back to localStorage polling
          startPolling();
        });
        
        return unsubscribe;
      } catch (error) {
        console.warn('Firebase subscription failed, falling back to polling:', error);
        startPolling();
      }
    } else {
      startPolling();
    }
  });

  // Fallback to polling localStorage
  function startPolling() {
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

  // Start with localStorage polling immediately
  return startPolling();
};