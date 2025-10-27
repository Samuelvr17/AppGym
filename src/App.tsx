import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { RoutineList } from './components/RoutineList';
import { CreateRoutine } from './components/CreateRoutine';
import { RoutineDetail } from './components/RoutineDetail';
import { WorkoutSession } from './components/WorkoutSession';
import { WorkoutHistory } from './components/WorkoutHistory';
import { WorkoutDetail } from './components/WorkoutDetail';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  Routine,
  Workout,
  Screen,
  MesocycleConfig,
  MesocycleProgress,
} from './types';
import { storageKeys } from './utils/storage';
import {
  calculateMesocycleProgress,
  getMesocycleSequence,
} from './utils/mesocycles';

function App() {
  const [routines, setRoutines] = useLocalStorage<Routine[]>(storageKeys.routines, []);
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>(storageKeys.workouts, []);
  const [mesocycleConfigs, setMesocycleConfigs] = useLocalStorage<
    Record<string, MesocycleConfig>
  >(storageKeys.mesocycles, {});
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('routines');
  const [activeTab, setActiveTab] = useState<'routines' | 'history'>('routines');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedMesocycle, setSelectedMesocycle] = useState<string>('all');

  useEffect(() => {
    const needsUpdate = routines.some((routine) => !routine.mesocycle);
    if (needsUpdate) {
      setRoutines(
        routines.map((routine) =>
          routine.mesocycle ? routine : { ...routine, mesocycle: 'General' }
        )
      );
    }
  }, [routines, setRoutines]);

  const routinesWithDefaults = useMemo(
    () =>
      routines.map((routine) => ({
        ...routine,
        mesocycle: routine.mesocycle || 'General',
      })),
    [routines]
  );

  const mesocycleSequences = useMemo(() => {
    const sequences: Record<string, Routine[]> = {};
    const names = new Set<string>();

    routinesWithDefaults.forEach((routine) => {
      names.add(routine.mesocycle);
    });

    names.forEach((name) => {
      sequences[name] = getMesocycleSequence(name, routinesWithDefaults);
    });

    return sequences;
  }, [routinesWithDefaults]);

  const mesocycleProgress = useMemo(() => {
    const progressMap: Record<string, MesocycleProgress> = {};
    const names = new Set<string>();

    routinesWithDefaults.forEach((routine) => {
      names.add(routine.mesocycle);
    });
    Object.keys(mesocycleConfigs).forEach((name) => names.add(name));

    names.forEach((name) => {
      progressMap[name] = calculateMesocycleProgress(
        name,
        routinesWithDefaults,
        workouts,
        mesocycleConfigs[name]
      );
    });

    return progressMap;
  }, [routinesWithDefaults, workouts, mesocycleConfigs]);

  const updateMesocycleConfig = useCallback(
    (mesocycle: string, updates: Partial<MesocycleConfig>) => {
      const key = mesocycle.trim();
      if (!key) {
        return;
      }

      setMesocycleConfigs((prev) => {
        const existing = prev[key];
        const next: MesocycleConfig = {
          durationWeeks:
            'durationWeeks' in updates && updates.durationWeeks !== undefined
              ? updates.durationWeeks
              : existing?.durationWeeks ?? 4,
          startDate:
            'startDate' in updates ? updates.startDate : existing?.startDate,
          completedCycleCount:
            updates.completedCycleCount ?? existing?.completedCycleCount ?? 0,
          weekOffset: updates.weekOffset ?? existing?.weekOffset ?? 0,
        };

        return {
          ...prev,
          [key]: next,
        };
      });
    },
    [setMesocycleConfigs]
  );

  const resetMesocycle = useCallback(
    (mesocycle: string, durationWeeks?: number) => {
      const key = mesocycle.trim();
      if (!key) {
        return;
      }

      setMesocycleConfigs((prev) => {
        const existing = prev[key];
        const nextDuration =
          durationWeeks ?? existing?.durationWeeks ?? 4;
        const concludedDuration = existing?.durationWeeks ?? 0;
        const accumulatedOffset = (existing?.weekOffset ?? 0) + concludedDuration;

        const next: MesocycleConfig = {
          durationWeeks: nextDuration,
          startDate: undefined,
          completedCycleCount: (existing?.completedCycleCount ?? 0) + 1,
          weekOffset: accumulatedOffset,
        };

        return {
          ...prev,
          [key]: next,
        };
      });
    },
    [setMesocycleConfigs]
  );

  const mesocycles = useMemo(() => {
    const unique = new Set<string>();
    routinesWithDefaults.forEach((routine) => unique.add(routine.mesocycle));
    return Array.from(unique);
  }, [routinesWithDefaults]);

  useEffect(() => {
    if (selectedMesocycle !== 'all' && !mesocycles.includes(selectedMesocycle)) {
      setSelectedMesocycle('all');
    }
  }, [mesocycles, selectedMesocycle]);

  const filteredRoutines = useMemo(() => {
    if (selectedMesocycle === 'all') {
      return routinesWithDefaults;
    }
    return routinesWithDefaults.filter(
      (routine) => routine.mesocycle === selectedMesocycle
    );
  }, [routinesWithDefaults, selectedMesocycle]);

  const handleCreateRoutine = () => {
    setCurrentScreen('create-routine');
  };

  const handleSaveRoutine = (routine: Routine) => {
    const existingIndex = routines.findIndex(r => r.id === routine.id);
    if (existingIndex >= 0) {
      const updatedRoutines = [...routines];
      updatedRoutines[existingIndex] = routine;
      setRoutines(updatedRoutines);
    } else {
      setRoutines([...routines, routine]);
    }
    setCurrentScreen('routines');
    setSelectedRoutine(null);
  };

  const handleSelectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setCurrentScreen('routine-detail');
  };

  const handleStartWorkout = () => {
    setCurrentScreen('workout-session');
  };

  const handleEditRoutine = () => {
    setCurrentScreen('edit-routine');
  };

  const handleSaveWorkout = (workout: Workout) => {
    const routine = routinesWithDefaults.find(
      (item) => item.id === workout.routineId
    );

    const updatedWorkouts = [...workouts, workout];
    setWorkouts(updatedWorkouts);

    if (routine) {
      const mesocycleName = routine.mesocycle;
      const existingConfig = mesocycleConfigs[mesocycleName];

      let configForProgress: MesocycleConfig = {
        durationWeeks: existingConfig?.durationWeeks ?? 4,
        startDate: existingConfig?.startDate ?? workout.date,
        completedCycleCount: existingConfig?.completedCycleCount ?? 0,
        weekOffset: existingConfig?.weekOffset ?? 0,
      };

      setMesocycleConfigs((prev) => {
        const current = prev[mesocycleName];
        const nextConfig: MesocycleConfig = {
          durationWeeks:
            current?.durationWeeks ?? configForProgress.durationWeeks,
          startDate: current?.startDate ?? configForProgress.startDate,
          completedCycleCount:
            current?.completedCycleCount ?? configForProgress.completedCycleCount,
          weekOffset: current?.weekOffset ?? configForProgress.weekOffset,
        };
        configForProgress = nextConfig;
        return {
          ...prev,
          [mesocycleName]: nextConfig,
        };
      });

      const progressAfterSave = calculateMesocycleProgress(
        mesocycleName,
        routinesWithDefaults,
        updatedWorkouts,
        configForProgress
      );

      if (
        progressAfterSave.isMesocycleComplete &&
        progressAfterSave.lastRoutineId === workout.routineId &&
        progressAfterSave.weeksCompleted === configForProgress.durationWeeks
      ) {
        const message = `Mesociclo "${mesocycleName}" completado tras ${configForProgress.durationWeeks} semanas.`;
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Mesociclo completado', { body: message });
        } else {
          alert(message);
        }
      }
    }

    setCurrentScreen('routines');
    setSelectedRoutine(null);
  };

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines(routines.filter((routine) => routine.id !== routineId));
    setWorkouts(workouts.filter((workout) => workout.routineId !== routineId));
    setCurrentScreen('routines');
    setSelectedRoutine(null);
  };

  const getLastWorkoutForRoutine = (routineId: string): Workout | undefined => {
    const routineWorkouts = workouts
      .filter((workout) => workout.routineId === routineId)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    return routineWorkouts[0];
  };

  const handleSelectWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentScreen('workout-detail');
  };

  const handleTabChange = (tab: 'routines' | 'history') => {
    setActiveTab(tab);
    if (tab === 'routines') {
      setCurrentScreen('routines');
    } else {
      setCurrentScreen('workout-history');
    }
  };

  const handleBack = () => {
    switch (currentScreen) {
      case 'create-routine':
      case 'edit-routine':
      case 'routine-detail':
      case 'workout-session':
        setCurrentScreen('routines');
        setActiveTab('routines');
        setSelectedRoutine(null);
        break;
      case 'workout-detail':
        setCurrentScreen('workout-history');
        setActiveTab('history');
        setSelectedWorkout(null);
        break;
      default:
        break;
    }
  };

  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'routines':
        return 'Rutinas';
      case 'create-routine':
        return 'Nueva Rutina';
      case 'edit-routine':
        return 'Editar Rutina';
      case 'routine-detail':
        return selectedRoutine?.name || 'Rutina';
      case 'workout-session':
        return 'Entrenamiento';
      case 'workout-history':
        return 'Historial';
      case 'workout-detail':
        return 'Detalles';
      default:
        return 'Gym Tracker';
    }
  };

  const shouldShowBack = () => {
    return currentScreen !== 'routines' && currentScreen !== 'workout-history';
  };

  const shouldShowNavigation = () => {
    return currentScreen === 'routines' || currentScreen === 'workout-history';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={getHeaderTitle()} 
        onBack={shouldShowBack() ? handleBack : undefined}
      />

      <main className="pt-0 max-w-3xl mx-auto w-full">
        {currentScreen === 'routines' && (
          <RoutineList
            routines={filteredRoutines}
            mesocycles={mesocycles}
            selectedMesocycle={selectedMesocycle}
            onSelectMesocycle={setSelectedMesocycle}
            onCreateRoutine={handleCreateRoutine}
            onSelectRoutine={handleSelectRoutine}
            mesocycleConfigs={mesocycleConfigs}
            mesocycleProgress={mesocycleProgress}
          />
        )}

        {currentScreen === 'create-routine' && (
          <CreateRoutine
            availableMesocycles={mesocycles}
            mesocycleConfigs={mesocycleConfigs}
            onConfigureMesocycle={updateMesocycleConfig}
            onSave={handleSaveRoutine}
            onCancel={handleBack}
          />
        )}

        {currentScreen === 'edit-routine' && selectedRoutine && (
          <CreateRoutine
            routine={selectedRoutine}
            availableMesocycles={mesocycles}
            mesocycleConfigs={mesocycleConfigs}
            onConfigureMesocycle={updateMesocycleConfig}
            onSave={handleSaveRoutine}
            onCancel={handleBack}
          />
        )}

        {currentScreen === 'routine-detail' && selectedRoutine && (
          <RoutineDetail
            routine={selectedRoutine}
            onStartWorkout={handleStartWorkout}
            onEditRoutine={handleEditRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            mesocycleConfig={mesocycleConfigs[selectedRoutine.mesocycle]}
            mesocycleProgress={mesocycleProgress[selectedRoutine.mesocycle]}
            sequence={mesocycleSequences[selectedRoutine.mesocycle] || []}
            onResetMesocycle={resetMesocycle}
          />
        )}

        {currentScreen === 'workout-session' && selectedRoutine && (
          <WorkoutSession
            routine={selectedRoutine}
            previousWorkout={getLastWorkoutForRoutine(selectedRoutine.id)}
            onSaveWorkout={handleSaveWorkout}
            onCancel={handleBack}
            mesocycleConfig={mesocycleConfigs[selectedRoutine.mesocycle]}
            mesocycleProgress={mesocycleProgress[selectedRoutine.mesocycle]}
            sequence={mesocycleSequences[selectedRoutine.mesocycle] || []}
          />
        )}

        {currentScreen === 'workout-history' && (
          <WorkoutHistory
            workouts={workouts}
            onSelectWorkout={handleSelectWorkout}
          />
        )}

        {currentScreen === 'workout-detail' && selectedWorkout && (
          <WorkoutDetail workout={selectedWorkout} />
        )}
      </main>

      {shouldShowNavigation() && (
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}

export default App;