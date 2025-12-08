import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Check,
  Target,
  Zap,
  Plus,
  X,
  MessageSquare,
  Clock,
  History,
} from 'lucide-react';
import {
  Routine,
  Workout,
  Exercise,
} from '../types';
import { generateId } from '../utils/storage';

interface WorkoutSessionProps {
  routine: Routine;
  previousWorkout?: Workout;
  onSaveWorkout: (workout: Workout) => void;
  onCancel: () => void;
}

export function WorkoutSession({
  routine,
  previousWorkout,
  onSaveWorkout,
  onCancel,
}: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutStartTime] = useState<number>(Date.now());
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [restDuration, setRestDuration] = useState<number>(() => {
    if (typeof window === 'undefined') return 60;
    const saved = localStorage.getItem('restDuration');
    return saved ? Number(saved) : 60;
  });
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('restVibrationEnabled');
    return saved ? saved === 'true' : true;
  });
  const [activeRest, setActiveRest] = useState<{ exerciseId: string; setIndex: number | null } | null>(null);
  const [wakeLockWarning, setWakeLockWarning] = useState<string>('');
  const [notificationWarning, setNotificationWarning] = useState<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const restIntervalRef = useRef<number | null>(null);
  const restStartTimeRef = useRef<number | null>(null);
  const restDurationRef = useRef<number>(restDuration);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const ensureAudioContextReady = useCallback(() => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (error) {
      console.warn('No se pudo inicializar el AudioContext', error);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as Navigator & {
      wakeLock?: {
        request?: (type: 'screen') => Promise<WakeLockSentinel>;
      };
    };

    if (!nav.wakeLock?.request) {
      setWakeLockWarning('Tu navegador no soporta mantener la pantalla activa durante el descanso.');
      return;
    }

    try {
      const sentinel = await nav.wakeLock.request('screen');
      if (sentinel) {
        wakeLockRef.current = sentinel;
        setWakeLockWarning('');
        sentinel.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      }
    } catch (error) {
      console.warn('No se pudo activar el wake lock', error);
      setWakeLockWarning('No se pudo mantener la pantalla activa. Tu dispositivo podría bloquearse durante el descanso.');
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
      }
    } catch (error) {
      console.warn('No se pudo liberar el wake lock', error);
    } finally {
      wakeLockRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('restDuration', String(restDuration));
    }
  }, [restDuration]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('restVibrationEnabled', String(isVibrationEnabled));
    }
  }, [isVibrationEnabled]);

  // Request notification permission on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window) || typeof Notification.requestPermission !== 'function') {
      setNotificationWarning('Tu navegador no soporta notificaciones de descanso.');
      return;
    }

    if (!window.isSecureContext) {
      setNotificationWarning('Las notificaciones requieren una conexión segura (HTTPS).');
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission()
        .then(permission => {
          if (permission !== 'granted') {
            setNotificationWarning('Activa las notificaciones del navegador para recibir avisos de descanso.');
          } else {
            setNotificationWarning('');
          }
        })
        .catch(error => {
          console.warn('No se pudo solicitar permiso para notificaciones', error);
          setNotificationWarning('No se pudo solicitar permiso para notificaciones.');
        });
    } else if (Notification.permission !== 'granted') {
      setNotificationWarning('Activa las notificaciones del navegador para recibir avisos de descanso.');
    } else {
      setNotificationWarning('');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerRestNotification = () => {
    const canNotify =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      typeof Notification.requestPermission === 'function' &&
      window.isSecureContext &&
      Notification.permission === 'granted';

    if (canNotify) {
      try {
        new Notification('Descanso completado', {
          body: 'Vuelve al siguiente ejercicio',
          silent: true,
        });
      } catch (error) {
        console.warn('No se pudo mostrar la notificación de descanso', error);
        setNotificationWarning('No se pudo mostrar la notificación de descanso en tu navegador.');
      }
    } else {
      console.warn('Las notificaciones no están disponibles o el permiso fue denegado.');
    }

    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
      }
    } catch (error) {
      console.error('No se pudo reproducir el sonido de descanso', error);
    }

    if (isVibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const nav = navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean };
      try {
        nav.vibrate?.([200, 100, 200]);
      } catch (error) {
        console.warn('No se pudo activar la vibración de descanso', error);
      }
    }
  };

  const handleRestComplete = useCallback(() => {
    triggerRestNotification();
    setIsResting(false);
    setActiveRest(null);
    releaseWakeLock();
  }, [releaseWakeLock]);

  const updateRestRemaining = useCallback(() => {
    if (!restStartTimeRef.current) return;
    const elapsed = Math.floor((Date.now() - restStartTimeRef.current) / 1000);
    const remaining = Math.max(restDurationRef.current - elapsed, 0);
    setRestRemaining(remaining);

    if (remaining === 0) {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
      handleRestComplete();
    }
  }, [handleRestComplete]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isResting) {
          updateRestRemaining();
          requestWakeLock();
        }
      } else if (document.visibilityState === 'hidden') {
        releaseWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isResting, releaseWakeLock, requestWakeLock, updateRestRemaining]);

  const startInterval = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    restIntervalRef.current = window.setInterval(updateRestRemaining, 1000);
  };

  const startRestTimer = (exerciseId: string, setIndex: number | null = null) => {
    ensureAudioContextReady();
    requestWakeLock();
    setActiveRest({ exerciseId, setIndex });
    restDurationRef.current = restDuration;
    restStartTimeRef.current = Date.now();
    setRestRemaining(restDuration);
    setIsResting(true);
    startInterval();
    updateRestRemaining();
  };

  const cancelRestTimer = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    setIsResting(false);
    setRestRemaining(0);
    setActiveRest(null);
    restStartTimeRef.current = null;
    releaseWakeLock();
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Duración de descanso (segundos)</h4>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min={15}
            max={240}
            step={5}
            value={restDuration}
            onChange={(e) => setRestDuration(Number(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min={5}
            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center"
            value={restDuration}
            onChange={(e) => setRestDuration(Math.max(5, Number(e.target.value) || 0))}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Este valor se guardará como preferencia para tus próximos descansos.
        </p>
        <div className="flex flex-col gap-1 mt-4">
          <label className="flex items-center justify-between text-sm text-gray-700">
            <span>Vibración al finalizar el descanso</span>
            <button
              type="button"
              role="switch"
              aria-checked={isVibrationEnabled}
              onClick={() => setIsVibrationEnabled(prev => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isVibrationEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isVibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
          <p className="text-xs text-gray-500">
            La vibración solo funciona en dispositivos compatibles.
          </p>
        </div>
        {wakeLockWarning && (
          <p className="text-xs text-amber-600 mt-2">
            {wakeLockWarning}
          </p>
        )}
        {notificationWarning && (
          <p className="text-xs text-amber-600 mt-2">
            {notificationWarning}
          </p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{routine.name}</h2>
        <p className="text-gray-600">Registra tu entrenamiento</p>
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
                  <div key={setIndex} className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-sm font-medium text-gray-600 w-7 text-center sm:text-left sm:w-8">
                      {setIndex + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, setIndex, 'weight', Number(e.target.value))}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">kg</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exercise.id, setIndex, 'reps', Number(e.target.value))}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">reps</span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 sm:ml-auto">
                      <button
                        type="button"
                        onClick={() => startRestTimer(exercise.id, setIndex)}
                        className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 w-full sm:w-auto"
                      >
                        {isResting && activeRest?.exerciseId === exercise.id && activeRest.setIndex === setIndex
                          ? 'Reiniciar'
                          : 'Desc.'}
                      </button>
                      {isResting && activeRest?.exerciseId === exercise.id && activeRest.setIndex === setIndex && (
                        <span className="text-center text-sm font-semibold text-green-600">
                          {formatTime(restRemaining)}
                        </span>
                      )}
                    </div>

                    {exercise.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(exercise.id, setIndex)}
                        className="self-end text-red-500 hover:text-red-700 p-1 sm:self-auto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isResting && activeRest?.exerciseId === exercise.id && activeRest.setIndex === null && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-green-50 text-green-700 px-3 py-2 rounded-lg mb-4">
                  <span className="text-sm font-semibold">Descanso en curso: {formatTime(restRemaining)}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <button onClick={() => startRestTimer(exercise.id, null)} className="underline">Reiniciar</button>
                    <button onClick={cancelRestTimer} className="underline">Cancelar</button>
                  </div>
                </div>
              )}

              {isResting && activeRest?.exerciseId === exercise.id && activeRest.setIndex !== null && (
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>
                    Descansando para {activeRest.setIndex !== null ? `serie ${activeRest.setIndex + 1}` : 'este ejercicio'}
                  </span>
                  <button onClick={cancelRestTimer} className="text-red-500 font-semibold">
                    Cancelar
                  </button>
                </div>
              )}

              {!isResting && (
                <button
                  type="button"
                  onClick={() => startRestTimer(exercise.id, null)}
                  className="mb-4 w-full text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                >
                  Iniciar descanso general
                </button>
              )}

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
