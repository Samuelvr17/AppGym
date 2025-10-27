import React from 'react';
import { Plus, Dumbbell, FolderOpen } from 'lucide-react';
import { Routine, MesocycleConfig, MesocycleProgress } from '../types';

interface RoutineListProps {
  routines: Routine[];
  mesocycles: string[];
  selectedMesocycle: string;
  onSelectMesocycle: (mesocycle: string) => void;
  onCreateRoutine: () => void;
  onSelectRoutine: (routine: Routine) => void;
  mesocycleConfigs: Record<string, MesocycleConfig>;
  mesocycleProgress: Record<string, MesocycleProgress>;
}

export function RoutineList({
  routines,
  mesocycles,
  selectedMesocycle,
  onSelectMesocycle,
  onCreateRoutine,
  onSelectRoutine,
  mesocycleConfigs,
  mesocycleProgress,
}: RoutineListProps) {
  const options = ['all', ...mesocycles];

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
          <FolderOpen className="w-4 h-4 mr-2" /> Mesociclos
        </h2>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onSelectMesocycle(option)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedMesocycle === option
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
              }`}
            >
              {option === 'all' ? 'Todos' : option}
            </button>
          ))}
        </div>
      </div>

      <div>
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
          <p className="text-gray-400 text-sm mt-2">
            {selectedMesocycle === 'all'
              ? 'Añade tu primera rutina para comenzar'
              : 'No hay rutinas en este mesociclo todavía'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => {
            const progress = mesocycleProgress[routine.mesocycle];
            const config = mesocycleConfigs[routine.mesocycle];
            const isNextRoutine = progress?.nextRoutineId === routine.id;
            const displayTotalWeeks =
              progress?.displayTotalWeeks ??
              ((config?.durationWeeks ?? 0) + (config?.weekOffset ?? 0));
            const currentWeek =
              progress?.currentWeekNumber ??
              (config ? (config.weekOffset ?? 0) + 1 : 0);

            return (
              <button
                key={routine.id}
                onClick={() => onSelectRoutine(routine)}
                className={`w-full bg-white border rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-shadow ${
                  isNextRoutine ? 'border-blue-400 shadow-blue-100' : 'border-gray-200'
                }`}
              >
                <h3 className="font-semibold text-gray-900 text-lg">{routine.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-3 mt-1">
                  <p className="text-gray-500 text-sm">
                    {routine.exercises.length} ejercicios
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                    {displayTotalWeeks ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                        Semana {currentWeek} de {displayTotalWeeks}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        Sin duración definida
                      </span>
                    )}
                    {isNextRoutine && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Próxima en la secuencia
                      </span>
                    )}
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {routine.mesocycle}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}