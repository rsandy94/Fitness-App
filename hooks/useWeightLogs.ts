import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { todayStr } from '@/lib/utils';

export function useWeightLogs() {
  return useQuery({
    queryKey: ['weightLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .order('logged_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTodayWeight() {
  const today = todayStr();
  return useQuery({
    queryKey: ['weightLogs', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('logged_date', today)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
}

export function useLogWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ logged_date, weight }: { logged_date: string; weight: number }) => {
      const { data, error } = await supabase
        .from('weight_logs')
        .upsert({ logged_date, weight })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightLogs'] });
    },
  });
}
