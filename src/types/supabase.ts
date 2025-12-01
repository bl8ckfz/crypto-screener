import type { AlertCondition, AlertSeverity } from './alert'

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
      user_settings: {
        Row: {
          id: string
          user_id: string
          current_pair: string
          current_list: number
          refresh_interval: number
          sort_field: string | null
          sort_direction: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_pair?: string
          current_list?: number
          refresh_interval?: number
          sort_field?: string | null
          sort_direction?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_pair?: string
          current_list?: number
          refresh_interval?: number
          sort_field?: string | null
          sort_direction?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      alert_settings: {
        Row: {
          id: string
          user_id: string
          cooldown_seconds: number
          max_alerts_per_symbol: number
          sound_enabled: boolean
          browser_notification_enabled: boolean
          webhook_enabled: boolean
          discord_webhook_url: string | null
          telegram_bot_token: string | null
          telegram_chat_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cooldown_seconds?: number
          max_alerts_per_symbol?: number
          sound_enabled?: boolean
          browser_notification_enabled?: boolean
          webhook_enabled?: boolean
          discord_webhook_url?: string | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cooldown_seconds?: number
          max_alerts_per_symbol?: number
          sound_enabled?: boolean
          browser_notification_enabled?: boolean
          webhook_enabled?: boolean
          discord_webhook_url?: string | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          symbols: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string
          symbols?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          symbols?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      alert_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          enabled: boolean
          conditions: AlertCondition[]
          symbols: string[]
          severity: AlertSeverity
          notification_enabled: boolean
          sound_enabled: boolean
          webhook_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          enabled?: boolean
          conditions: AlertCondition[]
          symbols?: string[]
          severity?: AlertSeverity
          notification_enabled?: boolean
          sound_enabled?: boolean
          webhook_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          enabled?: boolean
          conditions?: AlertCondition[]
          symbols?: string[]
          severity?: AlertSeverity
          notification_enabled?: boolean
          sound_enabled?: boolean
          webhook_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'discord' | 'telegram'
          url: string
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'discord' | 'telegram'
          url: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'discord' | 'telegram'
          url?: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      alert_history: {
        Row: {
          id: string
          user_id: string
          alert_rule_id: string | null
          symbol: string
          type: string
          severity: AlertSeverity
          title: string
          message: string | null
          value: number | null
          triggered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_rule_id?: string | null
          symbol: string
          type: string
          severity: AlertSeverity
          title: string
          message?: string | null
          value?: number | null
          triggered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_rule_id?: string | null
          symbol?: string
          type?: string
          severity?: AlertSeverity
          title?: string
          message?: string | null
          value?: number | null
          triggered_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
