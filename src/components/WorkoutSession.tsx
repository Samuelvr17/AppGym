import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  Target,
  Zap,
  Plus,
  X,
  MessageSquare,
  Clock,
  History,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react';
import {
  Routine,
  Workout,
  Exercise,
  MesocycleConfig,
  MesocycleProgress,
} from '../types';
import { generateId } from '../utils/storage';

interface WorkoutSessionProps {
  routine: Routine;
  previousWorkout?: Workout;
  onSaveWorkout: (workout: Workout) => void;
  onCancel: () => void;
  mesocycleConfig?: MesocycleConfig;
  mesocycleProgress?: MesocycleProgress;
  sequence: Routine[];
}

export function WorkoutSession({
  routine,
  previousWorkout,
  onSaveWorkout,
  onCancel,
  mesocycleConfig,
  mesocycleProgress,
  sequence,
}: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutStartTime] = useState<number>(Date.now());
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);

  const routineIndex = useMemo(
    () => sequence.findIndex((item) => item.id === routine.id),
    [sequence, routine.id]
  );

  const completedIds = mesocycleProgress?.completedRoutineIds ?? [];
  const remainingIds = mesocycleProgress?.remainingRoutineIds ?? sequence.map((item) => item.id);
  const hasCompletedThisWeek = completedIds.includes(routine.id);
  const isOnlyRemaining =
    !hasCompletedThisWeek &&
    remainingIds.length === 1 &&
    remainingIds[0] === routine.id;
  const pendingAfterThis = sequence
    .filter((item) =>
      item.id !== routine.id && remainingIds.includes(item.id)
    )
    .map((item) => item.name);
  const infoMessage = hasCompletedThisWeek
    ? 'Esta rutina ya está registrada esta semana.'
    : pendingAfterThis.length > 0
    ? `Tras esta sesión seguirán pendientes: ${pendingAfterThis.join(', ')}.`
    : 'Con esta sesión completarás todas las rutinas planificadas para la semana.';

  const willCloseWeek = isOnlyRemaining;

  const potentialCompletedWeeks = (mesocycleProgress?.weeksCompleted ?? 0) + 1;
  const willCompleteCycle =
    willCloseWeek &&
    mesocycleConfig?.durationWeeks !== undefined &&
    mesocycleConfig.durationWeeks > 0 &&
    potentialCompletedWeeks >= mesocycleConfig.durationWeeks;

  useEffect(() => {
    // Initialize with routine exercises but with empty weight/reps
    const workoutExercises = routine.exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(() => ({ weight: 0, reps: 0 })),
      notes: '' // Initialize notes as empty
    }));
    setExercises(workoutExercises);
  }, [routine]);

  // Workout duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkoutDuration(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets.map((set, index) =>
              index === setIndex ? { ...set, [field]: value } : set
            )
          }
        : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 0 }] }
        : ex
    ));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter((_, index) => index !== setIndex) }
        : ex
    ));
  };

  const updateNotes = (exerciseId: string, notes: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, notes } : ex
    ));
  };

  const handleSaveWorkout = () => {
    if (willCloseWeek) {
      const message = willCompleteCycle
        ? `Esta sesión cerrará la semana y el mesociclo de ${routine.mesocycle}. ¿Guardar entrenamiento?`
        : `Esta sesión completará la semana actual del mesociclo de ${routine.mesocycle}. ¿Guardar entrenamiento?`;
      const proceed = window.confirm(message);
      if (!proceed) {
        return;
      }
    }

    const workout: Workout = {
      id: generateId(),
      routineId: routine.id,
      routineName: routine.name,
      date: new Date().toISOString(),
      duration: workoutDuration,
      exercises: exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        technique: ex.technique,
        repRange: ex.repRange,
        notes: ex.notes
      }))
    };

    onSaveWorkout(workout);
  };

  return (
    <div className="p-4 pb-24">
      {/* Workout Timer Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center">
          <Clock className="w-6 h-6 mr-2" />
          <div>
            <p className="text-sm opacity-90">Tiempo de entrenamiento</p>
            <p className="text-2xl font-bold">{formatTime(workoutDuration)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold mb-1">{routine.mesocycle}</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{routine.name}</h2>
        <p className="text-gray-600">Registra tu entrenamiento</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-lg px-3 py-2">
            <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
            {infoMessage}
          </div>
          {willCloseWeek && (
            <div className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg ${
              willCompleteCycle
                ? 'bg-purple-100 text-purple-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              {willCompleteCycle
                ? 'Tras guardarla podrás finalizar el mesociclo desde la pantalla de rutina.'
                : 'Tras guardarla podrás cerrar la semana manualmente.'}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {exercises.map((exercise) => {
          const previousExercise = previousWorkout?.exercises.find(
            (prevExercise) => prevExercise.id === exercise.id
          );

          return (
            <div key={exercise.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{exercise.name}</h3>

              {(exercise.technique || exercise.repRange) && (
                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  {exercise.repRange && (
                    <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      <Target className="w-3 h-3 mr-1" />
                      {exercise.repRange} reps
                    </div>
                  )}
                  {exercise.technique && (
                    <div className="flex items-center bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3 mr-1" />
                      {exercise.technique}
                    </div>
                  )}
                </div>
              )}

              {previousWorkout && (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                    <History className="w-4 h-4 mr-2" /> Última semana
                  </div>
                  {!previousExercise ? (
                    <p className="text-sm text-gray-500">
                      Sin registros previos para este ejercicio.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {previousExercise.sets.map((set, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm text-gray-600"
                        >
                          <span className="font-medium">Serie {index + 1}</span>
                          <span>
                            {set.weight} kg × {set.reps} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-4">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 w-8">
                      {setIndex + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, setIndex, 'weight', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">kg</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exercise.id, setIndex, 'reps', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">reps</span>
                    </div>

                    {exercise.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(exercise.id, setIndex)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(exercise.id)}
                className="mb-4 text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir serie
              </button>

              {/* Campo de notas */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Notas
                </label>
                <textarea
                  value={exercise.notes || ''}
                  onChange={(e) => updateNotes(exercise.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Añade comentarios sobre este ejercicio..."
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSaveWorkout}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center"
        >
          <Check className="w-5 h-5 mr-2" />
          Guardar Entreno
        </button>
      </div>
    </div>
  );
}