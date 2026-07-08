import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://ubgmeqijydyzehxzkibj.supabase.co';
const supabaseAnonKey = 'sb_publishable_GZlgEqbZKKHFOAlFexfHYA_PWHYJH9G';

const isWeb = Platform.OS === 'web';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          name: string;
          workout_type: 'push' | 'pull' | 'lower' | 'upper';
          muscles_involved: string[];
          youtube_link: string;
          instructions: string | null;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          workout_type: 'push' | 'pull' | 'lower' | 'upper';
          muscles_involved: string[];
          youtube_link: string;
          instructions?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          workout_type?: 'push' | 'pull' | 'lower' | 'upper';
          muscles_involved?: string[];
          youtube_link?: string;
          instructions?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
      };
      workout_templates: {
        Row: {
          id: string;
          name: string;
          type: 'push' | 'pull' | 'lower' | 'upper';
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'push' | 'pull' | 'lower' | 'upper';
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'push' | 'pull' | 'lower' | 'upper';
          description?: string | null;
          created_at?: string;
        };
      };
      template_exercises: {
        Row: {
          id: string;
          template_id: string;
          exercise_id: string;
          sets: number;
          reps_range: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          template_id: string;
          exercise_id: string;
          sets?: number;
          reps_range: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          template_id?: string;
          exercise_id?: string;
          sets?: number;
          reps_range?: string;
          sort_order?: number;
        };
      };
      template_exercise_overrides: {
        Row: {
          id: string;
          template_exercise_id: string;
          exercise_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_exercise_id: string;
          exercise_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_exercise_id?: string;
          exercise_id?: string;
          created_at?: string;
        };
      };
      weekly_schedule: {
        Row: {
          id: string;
          day_of_week: number;
          template_id: string | null;
          is_rest_day: boolean;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          template_id?: string | null;
          is_rest_day?: boolean;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          template_id?: string | null;
          is_rest_day?: boolean;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          template_id: string | null;
          scheduled_date: string;
          status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'skipped';
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          scheduled_date: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'skipped';
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string | null;
          scheduled_date?: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'skipped';
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      set_entries: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string | null;
          set_number: number;
          weight: number | null;
          reps: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id?: string | null;
          set_number: number;
          weight?: number | null;
          reps?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          exercise_id?: string | null;
          set_number?: number;
          weight?: number | null;
          reps?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      weight_logs: {
        Row: {
          id: string;
          logged_date: string;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          logged_date: string;
          weight: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          logged_date?: string;
          weight?: number;
          created_at?: string;
        };
      };
    };
  };
};
