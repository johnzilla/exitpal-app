// Firebase Firestore service for ExitPal
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
import { db } from './firebase';
import { MessageType, MessageStatus, ScheduledMessage } from './message-service';

// Collection names
const MESSAGES_COLLECTION = 'messages';

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

// Convert ScheduledMessage for Firestore (replace Date with Timestamp)
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
 * Save a new scheduled message to Firestore
 */
export const saveMessage = async (message: Omit<ScheduledMessage, 'id' | 'createdAt'>): Promise<ScheduledMessage> => {
  try {
    const messageData = prepareMessageForFirestore(message);
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
    
    // Return the message with the generated ID
    return {
      id: docRef.id,
      ...message,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
    throw new Error('Failed to save message');
  }
};

/**
 * Get all messages for a specific user
 */
export const getUserMessages = async (userId: string): Promise<ScheduledMessage[]> => {
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
    console.error('Error getting user messages:', error);
    throw new Error('Failed to get messages');
  }
};

/**
 * Delete a message (cancel it)
 */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

/**
 * Update message status
 */
export const updateMessageStatus = async (messageId: string, status: MessageStatus): Promise<boolean> => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating message status:', error);
    return false;
  }
};

/**
 * Real-time listener for user messages
 * This allows the UI to update automatically when messages change
 */
export const subscribeToUserMessages = (
  userId: string, 
  callback: (messages: ScheduledMessage[]) => void
): (() => void) => {
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
  });
  
  return unsubscribe;
};

/**
 * Security validation: Check if user owns the message
 * This is important for security - users should only access their own messages
 */
export const validateMessageOwnership = async (messageId: string, userId: string): Promise<boolean> => {
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