import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useExercises(workoutType?: string) {
  return useQuery({
    queryKey: ['exercises', workoutType],
    queryFn: async () => {
      let query = supabase.from('exercises').select('*').order('name');
      if (workoutType) {
        query = query.eq('workout_type', workoutType);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useTemplateExercises(templateId: string) {
  return useQuery({
    queryKey: ['templateExercises', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_exercises')
        .select(`
          *,
          exercise:exercise_id(*)
        `)
        .eq('template_id', templateId)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });
}
