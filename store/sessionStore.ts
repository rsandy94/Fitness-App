import { create } from 'zustand';
import type { Database } from '@/lib/supabase';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type SetEntry = Database['public']['Tables']['set_entries']['Row'];

interface ExerciseSetData {
  id?: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  effort: 'none' | 'easy' | 'moderate' | 'hard';
}

interface SessionExercise {
  exercise: Exercise;
  sets: ExerciseSetData[];
  notes: string;
  reps_range: string;
  target_sets: number;
}

interface SessionState {
  sessionId: string | null;
  templateId: string | null;
  templateName: string;
  exercises: SessionExercise[];
  startedAt: string | null;
  elapsedSeconds: number;
  timerInterval: ReturnType<typeof setInterval> | null;

  startSession: (templateId: string, templateName: string, exercises: SessionExercise[]) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof ExerciseSetData, value: any) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateNotes: (exerciseIndex: number, notes: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  templateId: null,
  templateName: '',
  exercises: [],
  startedAt: null,
  elapsedSeconds: 0,
  timerInterval: null,

  startSession: (templateId, templateName, exercises) => {
    if (get().timerInterval) {
      clearInterval(get().timerInterval);
    }
    set({
      sessionId: null,
      templateId,
      templateName,
      exercises,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      timerInterval: null,
    });
  },

  updateSet: (exerciseIndex, setIndex, field, value) => {
    set((state) => {
      const exercises = [...state.exercises];
      const sets = [...exercises[exerciseIndex].sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return { exercises };
    });
  },

  addSet: (exerciseIndex) => {
    set((state) => {
      const exercises = [...state.exercises];
      const sets = [...exercises[exerciseIndex].sets];
      const lastSet = sets[sets.length - 1];
      sets.push({
        set_number: sets.length + 1,
        weight: lastSet?.weight ?? null,
        reps: lastSet?.reps ?? null,
        effort: 'none',
      });
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return { exercises };
    });
  },

  removeSet: (exerciseIndex, setIndex) => {
    set((state) => {
      const exercises = [...state.exercises];
      const sets = exercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      sets.forEach((s, i) => { s.set_number = i + 1; });
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
      return { exercises };
    });
  },

  updateNotes: (exerciseIndex, notes) => {
    set((state) => {
      const exercises = [...state.exercises];
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], notes };
      return { exercises };
    });
  },

  startTimer: () => {
    const interval = setInterval(() => {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
    }, 1000);
    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({ timerInterval: null });
  },

  resetSession: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({
      sessionId: null,
      templateId: null,
      templateName: '',
      exercises: [],
      startedAt: null,
      elapsedSeconds: 0,
      timerInterval: null,
    });
  },
}));
