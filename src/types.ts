export interface Set {
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  technique?: string; // Técnica para la última serie
  repRange?: string; // Rango de reps esperadas
  notes?: string; // Notas del ejercicio durante el entrenamiento
  videoUrl?: string; // Link a video tutorial del ejercicio
}

export interface Routine {
  id: string;
  name: string;
  mesocycle?: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface Workout {
  id: string;
  routineId: string;
  routineName: string;
  date: string;
  duration: number; // Duration in seconds
  exercises: {
    id: string;
    name: string;
    sets: Set[];
    technique?: string;
    repRange?: string;
    notes?: string; // Notas del ejercicio durante el entrenamiento
  }[];
}

export type Screen =
  | 'routines'
  | 'create-routine'
  | 'edit-routine'
  | 'routine-detail'
  | 'workout-session'
  | 'workout-history'
  | 'workout-detail';

