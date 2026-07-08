import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type RawTemplateExercise = {
  id: string;
  template_id: string;
  exercise_id: string;
  sets: number;
  reps_range: string;
  sort_order: number;
  exercise: any;
  overrides: { exercise_id: string; override_exercise: any } | { exercise_id: string; override_exercise: any }[] | null;
};

export type TemplateExercise = {
  id: string;
  template_id: string;
  sets: number;
  reps_range: string;
  sort_order: number;
  exercise: any;
  overridden: boolean;
  original_exercise_id: string;
};

function asArray<T>(v: T | T[] | null | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function mergeOverrides(raw: RawTemplateExercise[]): TemplateExercise[] {
  return raw.map((row) => {
    const ov = asArray(row.overrides)[0];
    return {
      id: row.id,
      template_id: row.template_id,
      sets: row.sets,
      reps_range: row.reps_range,
      sort_order: row.sort_order,
      exercise: ov?.override_exercise ?? row.exercise,
      overridden: !!ov,
      original_exercise_id: row.exercise_id,
    };
  });
}

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

export function useAllExercises() {
  return useQuery({
    queryKey: ['exercises', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
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
          exercise:exercise_id(*),
          overrides:template_exercise_overrides(
            exercise_id,
            override_exercise:exercise_id(*)
          )
        `)
        .eq('template_id', templateId)
        .order('sort_order');
      if (error) throw error;
      return mergeOverrides((data ?? []) as unknown as RawTemplateExercise[]);
    },
    enabled: !!templateId,
  });
}

export function useTemplateExercise(id: string) {
  return useQuery({
    queryKey: ['templateExercise', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_exercises')
        .select(`
          *,
          exercise:exercise_id(*),
          overrides:template_exercise_overrides(
            exercise_id,
            override_exercise:exercise_id(*)
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      const merged = mergeOverrides([data as unknown as RawTemplateExercise]);
      return merged[0];
    },
    enabled: !!id,
  });
}

export function useSwapExercise(templateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      templateExerciseId,
      newExerciseId,
    }: {
      templateExerciseId: string;
      newExerciseId: string;
    }) => {
      const { error } = await supabase
        .from('template_exercise_overrides')
        .upsert(
          { template_exercise_id: templateExerciseId, exercise_id: newExerciseId },
          { onConflict: 'template_exercise_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templateExercises', templateId] });
      qc.invalidateQueries({ queryKey: ['templateExercise'] });
    },
  });
}

export function useUndoSwap(templateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateExerciseId: string) => {
      const { error } = await supabase
        .from('template_exercise_overrides')
        .delete()
        .eq('template_exercise_id', templateExerciseId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templateExercises', templateId] });
      qc.invalidateQueries({ queryKey: ['templateExercise'] });
    },
  });
}
