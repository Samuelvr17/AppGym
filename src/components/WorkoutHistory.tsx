import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { Workout } from '../types';
import { formatDate, formatDateShort } from '../utils/storage';

interface WorkoutHistoryProps {
  workouts: Workout[];
  onSelectWorkout: (workout: Workout) => void;
}

export function WorkoutHistory({ workouts, onSelectWorkout }: WorkoutHistoryProps) {
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Historial</h2>
        <p className="text-gray-600">{workouts.length} entrenamientos registrados</p>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay entrenamientos registrados</p>
          <p className="text-gray-400 text-sm mt-2">Completa tu primera rutina para ver el historial</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedWorkouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => onSelectWorkout(workout)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{workout.routineName}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {workout.exercises.length} ejercicios
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDateShort(workout.date)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}