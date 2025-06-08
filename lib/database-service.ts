import { supabase } from './supabase';
import type { Profile, ScheduledMessage, TwilioNumber } from './supabase';

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  return true;
};

// Message operations
export const createScheduledMessage = async (
  message: Omit<ScheduledMessage, 'id' | 'created_at' | 'updated_at'>
): Promise<ScheduledMessage | null> => {
  const { data, error } = await supabase
    .from('scheduled_messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    return null;
  }

  return data;
};

export const getUserMessages = async (userId: string): Promise<ScheduledMessage[]> => {
  const { data, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_time', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
};

export const updateMessageStatus = async (
  messageId: string,
  status: ScheduledMessage['status'],
  twilioMessageId?: string
): Promise<boolean> => {
  const updates: any = { status };
  if (twilioMessageId) {
    updates.twilio_message_id = twilioMessageId;
  }

  const { error } = await supabase
    .from('scheduled_messages')
    .update(updates)
    .eq('id', messageId);

  if (error) {
    console.error('Error updating message status:', error);
    return false;
  }

  return true;
};

export const deleteMessage = async (messageId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('scheduled_messages')
    .delete()
    .eq('id', messageId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting message:', error);
    return false;
  }

  return true;
};

// Twilio numbers
export const getAvailableTwilioNumbers = async (): Promise<TwilioNumber[]> => {
  const { data, error } = await supabase
    .from('twilio_numbers')
    .select('*')
    .eq('is_available', true)
    .order('is_premium', { ascending: true });

  if (error) {
    console.error('Error fetching Twilio numbers:', error);
    return [];
  }

  return data || [];
};

export const getDefaultTwilioNumber = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('twilio_numbers')
    .select('phone_number')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    console.error('Error fetching default number:', error);
    return '+12312345678'; // Fallback
  }

  return data.phone_number;
};