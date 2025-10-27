import { Routine, Workout } from '../types';

export const storageKeys = {
  routines: 'gym-tracker-routines',
  workouts: 'gym-tracker-workouts',
  mesocycles: 'gym-tracker-mesocycles',
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
  });
}