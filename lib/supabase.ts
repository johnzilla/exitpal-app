import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Profile {
  id: string;
  email: string;
  phone?: string;
  is_premium: boolean;
  selected_twilio_number_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMessage {
  id: string;
  user_id: string;
  contact_name: string;
  message_content: string;
  phone_number: string;
  scheduled_time: string;
  message_type: 'sms' | 'voice';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  twilio_message_id?: string;
  from_number?: string;
  created_at: string;
  updated_at: string;
}

export interface TwilioNumber {
  id: string;
  phone_number: string;
  label: string;
  is_premium: boolean;
  is_available: boolean;
  created_at: string;
}