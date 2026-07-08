export const MUSCLE_GROUP_MAP: Record<string, string> = {
  'chest': 'Chest',
  'upper chest': 'Chest',
  'middle chest': 'Chest',
  'lower chest': 'Chest',

  'shoulders': 'Shoulders',
  'front delts': 'Shoulders',
  'side delts': 'Shoulders',
  'rear delts': 'Shoulders',

  'biceps': 'Biceps',
  'brachialis': 'Biceps',

  'triceps': 'Triceps',

  'back': 'Back',
  'lats': 'Back',
  'mid back': 'Back',
  'mid/upper back': 'Back',
  'upper back': 'Back',
  'lower back': 'Back',
  'traps': 'Back',
  'rhomboids': 'Back',

  'legs': 'Legs',
  'quads': 'Legs',
  'hamstrings': 'Legs',
  'calves': 'Legs',

  'glutes': 'Glutes',
  'lower glutes': 'Glutes',

  'forearms': 'Forearms',
  'grip': 'Forearms',

  'core': 'Core',
  'abs': 'Core',
  'obliques': 'Core',
};

export const MAIN_MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Forearms',
];

function lookupMuscle(muscle: string): string | null {
  return MUSCLE_GROUP_MAP[muscle.toLowerCase().trim()] || null;
}

export function getMainMuscleGroup(muscle: string): string | null {
  if (!muscle) return null;
  const direct = lookupMuscle(muscle);
  if (direct) return direct;
  for (const part of muscle.split(',')) {
    const t = part.trim();
    if (!t) continue;
    const m = lookupMuscle(t);
    if (m) return m;
  }
  return null;
}

function explodeMuscles(muscles: string[] = []): string[] {
  const out: string[] = [];
  for (const m of muscles) {
    if (!m) continue;
    if (m.includes(',')) {
      for (const p of m.split(',')) {
        const t = p.trim();
        if (t) out.push(t);
      }
    } else {
      const t = m.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

export function exerciseMuscleGroups(muscles: string[] = []): string[] {
  const exploded = explodeMuscles(muscles);
  const groups = exploded.map(getMainMuscleGroup).filter((g): g is string => !!g);
  return [...new Set(groups)];
}

export function countMuscleOverlap(a: string[] = [], b: string[] = []): number {
  const groupsA = exerciseMuscleGroups(a);
  const groupsB = exerciseMuscleGroups(b);
  if (!groupsA.length || !groupsB.length) return 0;
  const setA = new Set(groupsA);
  let count = 0;
  for (const g of groupsB) {
    if (setA.has(g)) count++;
  }
  return count;
}
