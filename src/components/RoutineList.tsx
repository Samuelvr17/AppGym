import React from 'react';
import { Plus, Dumbbell } from 'lucide-react';
import { Routine } from '../types';

interface RoutineListProps {
  routines: Routine[];
  onCreateRoutine: () => void;
  onSelectRoutine: (routine: Routine) => void;
}

export function RoutineList({ routines, onCreateRoutine, onSelectRoutine }: RoutineListProps) {
  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <button
          onClick={onCreateRoutine}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          <Plus className="w-6 h-6 mr-2" />
          Añadir Rutina
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay rutinas creadas</p>
          <p className="text-gray-400 text-sm mt-2">Añade tu primera rutina para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <button
              key={routine.id}
              onClick={() => onSelectRoutine(routine)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 text-lg">{routine.name}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {routine.exercises.length} ejercicios
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}