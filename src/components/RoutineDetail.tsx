
import { Play, Edit, Target, Zap, Trash2 } from 'lucide-react';
import { Routine } from '../types';

interface RoutineDetailProps {
  routine: Routine;
  onStartWorkout: () => void;
  onEditRoutine: () => void;
  onDeleteRoutine: (routineId: string) => void;
}

export function RoutineDetail({
  routine,
  onStartWorkout,
  onEditRoutine,
  onDeleteRoutine,
}: RoutineDetailProps) {
  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{routine.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">{routine.exercises.length} ejercicios</p>
      </div>

      <div className="space-y-4 mb-8">
        {routine.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{exercise.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{exercise.sets.length} series</p>

            {(exercise.technique || exercise.repRange) && (
              <div className="flex flex-wrap gap-2 text-xs">
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => {
            if (window.confirm('¿Quieres eliminar esta rutina? Esta acción también borrará su historial.')) {
              onDeleteRoutine(routine.id);
            }
          }}
          className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-4 px-6 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Eliminar
        </button>
        <button
          onClick={onEditRoutine}
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
        >
          <Edit className="w-5 h-5 mr-2" />
          Editar
        </button>
        <button
          onClick={onStartWorkout}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center"
        >
          <Play className="w-5 h-5 mr-2" />
          Iniciar
        </button>
      </div>
    </div>
  );
}
