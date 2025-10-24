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
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          timezone: string | null
          default_view: string | null
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          timezone?: string | null
          default_view?: string | null
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          timezone?: string | null
          default_view?: string | null
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      saved_filters: {
        Row: {
          id: string
          user_id: string
          name: string
          entity_type: string
          filter_config: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          entity_type: string
          filter_config: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          entity_type?: string
          filter_config?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dashboard_layouts: {
        Row: {
          id: string
          user_id: string
          name: string
          layout_config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          layout_config: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          layout_config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notion_cache: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          data: Json
          cached_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          data: Json
          cached_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          data?: Json
          cached_at?: string
          expires_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          changes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          changes?: Json | null
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
      [_ in never]: never
    }
  }
}
