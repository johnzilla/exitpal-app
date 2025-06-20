export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          user_id: string
          contact_name: string
          message_content: string
          phone_number: string
          scheduled_time: string
          message_type: 'sms' | 'voice'
          status: 'pending' | 'sent' | 'failed'
          created_at: string
          vonage_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          contact_name: string
          message_content: string
          phone_number: string
          scheduled_time: string
          message_type: 'sms' | 'voice'
          status?: 'pending' | 'sent' | 'failed'
          created_at?: string
          vonage_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          contact_name?: string
          message_content?: string
          phone_number?: string
          scheduled_time?: string
          message_type?: 'sms' | 'voice'
          status?: 'pending' | 'sent' | 'failed'
          created_at?: string
          vonage_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          is_premium?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      message_type: 'sms' | 'voice'
      message_status: 'pending' | 'sent' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}