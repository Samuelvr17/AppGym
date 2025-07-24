import React, { useState, useEffect } from 'react';
import { Check, Target, Zap, Plus, X, MessageSquare, Clock, Timer } from 'lucide-react';
import { Routine, Workout, Exercise } from '../types';
import { generateId } from '../utils/storage';

interface WorkoutSessionProps {
  routine: Routine;
  onSaveWorkout: (workout: Workout) => void;
  onCancel: () => void;
}

export function WorkoutSession({ routine, onSaveWorkout, onCancel }: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(Date.now());
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [activeRestTimer, setActiveRestTimer] = useState<string | null>(null); // exerciseId-setIndex
  const [restTimers, setRestTimers] = useState<{[key: string]: number}>({});
  const [restIntervals, setRestIntervals] = useState<{[key: string]: number}>({});

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

  const startRestTimer = (exerciseId: string, setIndex: number, duration: number) => {
    const timerId = `${exerciseId}-${setIndex}`;
    
    // Clear any existing timer for this set
    if (restIntervals[timerId]) {
      clearInterval(restIntervals[timerId]);
    }
    
    setActiveRestTimer(timerId);
    setRestTimers(prev => ({ ...prev, [timerId]: duration }));
    
    const interval = setInterval(() => {
      setRestTimers(prev => {
        const newTime = prev[timerId] - 1;
        if (newTime <= 0) {
          // Timer finished
          clearInterval(interval);
          setActiveRestTimer(null);
          
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('¡Tiempo de descanso terminado!', {
              body: 'Es hora de continuar con la siguiente serie',
              icon: '/vite.svg'
            });
          }
          
          // Vibrate if available
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          
          return { ...prev, [timerId]: 0 };
        }
        return { ...prev, [timerId]: newTime };
      });
    }, 1000);
    
    setRestIntervals(prev => ({ ...prev, [timerId]: interval }));
  };

  const stopRestTimer = (exerciseId: string, setIndex: number) => {
    const timerId = `${exerciseId}-${setIndex}`;
    
    if (restIntervals[timerId]) {
      clearInterval(restIntervals[timerId]);
      setRestIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[timerId];
        return newIntervals;
      });
    }
    
    setActiveRestTimer(null);
    setRestTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[timerId];
      return newTimers;
    });
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
    <div className="p-4 pb-20">
      {/* Workout Timer Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-6 h-6 mr-2" />
            <div>
              <p className="text-sm opacity-90">Tiempo de entrenamiento</p>
              <p className="text-2xl font-bold">{formatTime(workoutDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{routine.name}</h2>
        <p className="text-gray-600">Registra tu entrenamiento</p>
      </div>

      <div className="space-y-6 mb-8">
        {exercises.map((exercise) => (
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
                  
                  {/* Rest Timer for each set */}
                  <div className="flex items-center space-x-2">
                    {activeRestTimer === `${exercise.id}-${setIndex}` ? (
                      <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-lg">
                        <Timer className="w-4 h-4 text-yellow-600 mr-1" />
                        <span className="text-sm font-medium text-yellow-700">
                          {formatTime(restTimers[`${exercise.id}-${setIndex}`] || 0)}
                        </span>
                        <button
                          onClick={() => stopRestTimer(exercise.id, setIndex)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => startRestTimer(exercise.id, setIndex, 90)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          1:30
                        </button>
                        <button
                          onClick={() => startRestTimer(exercise.id, setIndex, 180)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          3:00
                        </button>
                      </div>
                    )}
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
        ))}
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