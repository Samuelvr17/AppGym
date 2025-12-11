import { useState, useEffect } from 'react';
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
} from './types';
import { storageKeys } from './utils/storage';

function App() {
  const [routines, setRoutines] = useLocalStorage<Routine[]>(storageKeys.routines, []);
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>(storageKeys.workouts, []);

  const [currentScreen, setCurrentScreen] = useState<Screen>('routines');
  const [activeTab, setActiveTab] = useState<'routines' | 'history'>('routines');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  useEffect(() => {
    window.localStorage.removeItem(storageKeys.mesocycles);

    // Check for active workout session
    const activeWorkoutJson = localStorage.getItem(storageKeys.activeWorkout);
    if (activeWorkoutJson) {
      try {
        const activeWorkout = JSON.parse(activeWorkoutJson);
        // Find the routine associated with the active workout
        const routine = routines.find(r => r.id === activeWorkout.routineId);
        if (routine) {
          setSelectedRoutine(routine);
          setCurrentScreen('workout-session');
        }
      } catch (error) {
        console.error('Error restoring active workout:', error);
      }
    }
  }, [routines]);

  const handleCreateRoutine = () => {
    setCurrentScreen('create-routine');
  };

  const handleSaveRoutine = (routine: Routine) => {
    setRoutines((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === routine.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = routine;
        return updated;
      }
      return [...prev, routine];
    });
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
    setWorkouts((prev) => [...prev, workout]);
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

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(workouts.filter((workout) => workout.id !== workoutId));
    setCurrentScreen('workout-history');
    setSelectedWorkout(null);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header
        title={getHeaderTitle()}
        onBack={shouldShowBack() ? handleBack : undefined}
      />

      <main className="pt-0 max-w-3xl mx-auto w-full">
        {currentScreen === 'routines' && (
          <RoutineList
            routines={routines}
            onCreateRoutine={handleCreateRoutine}
            onSelectRoutine={handleSelectRoutine}
          />
        )}

        {currentScreen === 'create-routine' && (
          <CreateRoutine
            onSave={handleSaveRoutine}
            onCancel={handleBack}
          />
        )}

        {currentScreen === 'edit-routine' && selectedRoutine && (
          <CreateRoutine
            routine={selectedRoutine}
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
          />
        )}

        {currentScreen === 'workout-session' && selectedRoutine && (
          <WorkoutSession
            routine={selectedRoutine}
            previousWorkout={getLastWorkoutForRoutine(selectedRoutine.id)}
            onSaveWorkout={handleSaveWorkout}
            onCancel={handleBack}
          />
        )}

        {currentScreen === 'workout-history' && (
          <WorkoutHistory
            workouts={workouts}
            onSelectWorkout={handleSelectWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {currentScreen === 'workout-detail' && selectedWorkout && (
          <WorkoutDetail
            workout={selectedWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
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
