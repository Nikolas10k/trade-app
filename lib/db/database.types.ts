export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ChecklistJson = Record<string, boolean>;

type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";
type SubscriptionPlan = "mensal" | "trimestral" | "anual";
type ExitType = "parcial" | "0x0" | "cheio" | "loss";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          timezone: string;
          language: string;
          risk_limit_pct: number;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        // Só o trigger on_auth_user_created (security definer) insere aqui.
        Insert: {
          id: string;
          display_name?: string | null;
          timezone?: string;
          language?: string;
          risk_limit_pct?: number;
          is_suspended?: boolean;
        };
        Update: Partial<{
          display_name: string | null;
          timezone: string;
          language: string;
          risk_limit_pct: number;
        }>;
        Relationships: [];
      };
      instruments: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          pip_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          symbol: string;
          pip_value?: number;
          created_at?: string;
        };
        Update: Partial<{ symbol: string; pip_value: number }>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: SubscriptionStatus;
          plan: SubscriptionPlan | null;
          trial_ends_at: string | null;
          current_period_end: string | null;
          comp_until: string | null;
          mp_preapproval_id: string | null;
          mp_payer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        // Escrita só via service role (webhook/admin) — nunca pelo client anon/authenticated.
        Insert: {
          id?: string;
          user_id: string;
          status?: SubscriptionStatus;
          plan?: SubscriptionPlan | null;
          trial_ends_at?: string | null;
          current_period_end?: string | null;
          comp_until?: string | null;
          mp_preapproval_id?: string | null;
          mp_payer_id?: string | null;
        };
        Update: Partial<{
          status: SubscriptionStatus;
          plan: SubscriptionPlan | null;
          trial_ends_at: string | null;
          current_period_end: string | null;
          comp_until: string | null;
          mp_preapproval_id: string | null;
          mp_payer_id: string | null;
        }>;
        Relationships: [];
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          traded_at: string;
          symbol: string;
          account_balance: number;
          entry_price: number;
          stop_price: number;
          ref_channel_pips: number | null;
          lot_size: number;
          target_pct: number | null;
          exit_type: ExitType;
          result_total: number;
          pip_value: number;
          checklist: ChecklistJson;
          discipline_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          traded_at: string;
          symbol?: string;
          account_balance: number;
          entry_price: number;
          stop_price: number;
          ref_channel_pips?: number | null;
          lot_size: number;
          target_pct?: number | null;
          exit_type: ExitType;
          result_total: number;
          pip_value: number;
          checklist?: ChecklistJson;
          discipline_score?: number | null;
        };
        Update: Partial<{
          traded_at: string;
          symbol: string;
          account_balance: number;
          entry_price: number;
          stop_price: number;
          ref_channel_pips: number | null;
          lot_size: number;
          target_pct: number | null;
          exit_type: ExitType;
          result_total: number;
          pip_value: number;
          checklist: ChecklistJson;
          discipline_score: number | null;
        }>;
        Relationships: [];
      };
      screen_time_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_date: string;
          hours: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          logged_date: string;
          hours: number;
          created_at?: string;
        };
        Update: Partial<{ logged_date: string; hours: number }>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          user_id: string | null;
          action: string;
          metadata: Json | null;
          ip: string | null;
          created_at: string;
        };
        // Escrita só via service role.
        Insert: {
          id?: string;
          actor_id?: string | null;
          user_id?: string | null;
          action: string;
          metadata?: Json | null;
          ip?: string | null;
        };
        Update: Partial<{
          actor_id: string | null;
          user_id: string | null;
          action: string;
          metadata: Json | null;
          ip: string | null;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
