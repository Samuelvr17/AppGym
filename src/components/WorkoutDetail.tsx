import React from 'react';
import { Calendar, Target, Zap, MessageSquare, Clock } from 'lucide-react';
import { Workout } from '../types';
import { formatDate } from '../utils/storage';

interface WorkoutDetailProps {
  workout: Workout;
}

export function WorkoutDetail({ workout }: WorkoutDetailProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{workout.routineName}</h2>
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(workout.date)}
          </div>
          {workout.duration && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Duración: {formatDuration(workout.duration)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {workout.exercises.map((exercise) => (
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
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-2 font-medium">
                <span className="w-8">Serie</span>
                <span className="w-20 text-center">Peso</span>
                <span className="w-20 text-center">Reps</span>
              </div>
              
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center text-sm">
                  <span className="w-8 text-gray-600">{setIndex + 1}</span>
                  <span className="w-20 text-center font-medium">{set.weight} kg</span>
                  <span className="w-20 text-center font-medium">{set.reps}</span>
                </div>
              ))}
            </div>

            {/* Mostrar notas si existen */}
            {exercise.notes && exercise.notes.trim() && (
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Notas
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {exercise.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}