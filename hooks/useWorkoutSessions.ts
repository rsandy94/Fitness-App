import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { todayStr } from '@/lib/utils';

export function useWeeklySchedule() {
  return useQuery({
    queryKey: ['weeklySchedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_schedule')
        .select(`
          *,
          template:template_id(*)
        `)
        .order('day_of_week');
      if (error) throw error;
      return data;
    },
  });
}

export function useWorkoutSessions(date?: string) {
  return useQuery({
    queryKey: ['workoutSessions', date],
    queryFn: async () => {
      let query = supabase.from('workout_sessions').select('*').order('scheduled_date', { ascending: false });
      if (date) {
        query = query.eq('scheduled_date', date);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: { template_id: string; scheduled_date: string }) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({ ...session, status: 'in_progress', started_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutSessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; completed_at?: string }) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutSessions'] });
    },
  });
}

export function useSessionSetEntries(sessionId: string) {
  return useQuery({
    queryKey: ['setEntries', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('set_entries')
        .select('*')
        .eq('session_id', sessionId)
        .order('exercise_id')
        .order('set_number');
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

export function useSaveSetEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entries: { session_id: string; exercise_id: string; set_number: number; weight: number | null; reps: number | null }[]) => {
      const { data, error } = await supabase
        .from('set_entries')
        .upsert(entries)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setEntries'] });
    },
  });
}
