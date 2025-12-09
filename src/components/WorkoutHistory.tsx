import { Calendar, TrendingUp, Clock, Trash2 } from 'lucide-react';
import { Workout } from '../types';
import { formatDateShort } from '../utils/storage';

interface WorkoutHistoryProps {
  workouts: Workout[];
  onSelectWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export function WorkoutHistory({ workouts, onSelectWorkout, onDeleteWorkout }: WorkoutHistoryProps) {
  const sortedWorkouts = [...workouts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleDelete = (e: React.MouseEvent, workoutId: string) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este entrenamiento?')) {
      onDeleteWorkout(workoutId);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Historial</h2>
        <p className="text-gray-600 dark:text-gray-400">{workouts.length} entrenamientos registrados</p>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay entrenamientos registrados</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Completa tu primera rutina para ver el historial</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedWorkouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => onSelectWorkout(workout)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{workout.routineName}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {workout.exercises.length} ejercicios  {formatDuration(workout.duration || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDateShort(workout.date)}
                    </div>
                    {workout.duration && (
                      <div className="flex items-center text-gray-400 text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(workout.duration)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, workout.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Eliminar entrenamiento"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
