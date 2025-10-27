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
}

export interface Routine {
  id: string;
  name: string;
  mesocycle: string;
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

export interface MesocycleConfig {
  durationWeeks: number;
  startDate?: string;
  completedCycleCount: number;
}

export interface MesocycleProgress {
  weeksCompleted: number;
  currentWeekNumber: number;
  currentSequenceIndex: number;
  totalRoutines: number;
  lastRoutineId?: string;
  nextRoutineId?: string;
  isWeekComplete: boolean;
  isMesocycleComplete: boolean;
}

export type Screen =
  | 'routines'
  | 'create-routine'
  | 'edit-routine'
  | 'routine-detail'
  | 'workout-session'
  | 'workout-history'
  | 'workout-detail';

