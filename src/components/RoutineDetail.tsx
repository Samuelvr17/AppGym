import React from 'react';
import { Play, Edit, Target, Zap, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Routine, MesocycleConfig, MesocycleProgress } from '../types';

interface RoutineDetailProps {
  routine: Routine;
  onStartWorkout: () => void;
  onEditRoutine: () => void;
  onDeleteRoutine: (routineId: string) => void;
  mesocycleConfig?: MesocycleConfig;
  mesocycleProgress?: MesocycleProgress;
  sequence: Routine[];
  onResetMesocycle: (mesocycle: string, durationWeeks?: number) => void;
  onCompleteWeek: (mesocycle: string) => void;
}

export function RoutineDetail({
  routine,
  onStartWorkout,
  onEditRoutine,
  onDeleteRoutine,
  mesocycleConfig,
  mesocycleProgress,
  sequence,
  onResetMesocycle,
  onCompleteWeek,
}: RoutineDetailProps) {
  const blockDuration = mesocycleConfig?.durationWeeks;
  const displayTotalWeeks =
    mesocycleProgress?.displayTotalWeeks ??
    ((mesocycleConfig?.durationWeeks ?? 0) + (mesocycleConfig?.weekOffset ?? 0));
  const currentWeek =
    mesocycleProgress?.currentWeekNumber ??
    (mesocycleConfig ? (mesocycleConfig.weekOffset ?? 0) + 1 : 0);
  const completedCycles = mesocycleConfig?.completedCycleCount ?? 0;
  const completedThisWeek =
    mesocycleProgress?.completedRoutineIds?.includes(routine.id) ?? false;
  const pendingThisWeek =
    mesocycleProgress?.remainingRoutineIds?.includes(routine.id) ?? false;
  const remainingNames = sequence
    .filter((item) =>
      mesocycleProgress?.remainingRoutineIds?.includes(item.id) ?? false
    )
    .map((item) => item.name);
  const completedNames = sequence
    .filter((item) =>
      mesocycleProgress?.completedRoutineIds?.includes(item.id) ?? false
    )
    .map((item) => item.name);
  const isCycleComplete =
    Boolean(
      blockDuration &&
        mesocycleProgress?.isMesocycleComplete &&
        mesocycleProgress.weeksCompleted >= blockDuration
    );
  const canCompleteWeek = Boolean(
    mesocycleProgress?.isWeekComplete && !mesocycleProgress.isMesocycleComplete
  );

  const handleResetMesocycle = () => {
    const baseDuration = blockDuration ?? 4;
    const input = window.prompt(
      '¿Cuántas semanas tendrá el siguiente mesociclo?',
      String(baseDuration)
    );

    if (input === null) {
      return;
    }

    const parsed = Number.parseInt(input, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      alert('Introduce una duración válida en semanas');
      return;
    }

    onResetMesocycle(routine.mesocycle, parsed);
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold mb-1">{routine.mesocycle}</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{routine.name}</h2>
        <p className="text-gray-600">{routine.exercises.length} ejercicios</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {displayTotalWeeks ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              Semana {currentWeek} de {displayTotalWeeks}
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              Sin duración definida
            </span>
          )}
          {isCycleComplete && (
            <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              Mesociclo completado
            </span>
          )}
          {completedCycles > 0 && (
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              Ciclos finalizados: {completedCycles}
            </span>
          )}
          {completedThisWeek && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              Registrada esta semana
            </span>
          )}
          {pendingThisWeek && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Pendiente esta semana
            </span>
          )}
        </div>
        {remainingNames.length > 0 ? (
          <p className="text-sm text-gray-500 mt-2">
            Rutinas pendientes esta semana:{' '}
            <span className="font-medium text-gray-700">
              {remainingNames.join(', ')}
            </span>
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            Todas las rutinas de esta semana han sido registradas.
          </p>
        )}
        {completedNames.length > 0 && remainingNames.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Completadas: {completedNames.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {routine.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{exercise.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{exercise.sets.length} series</p>
            
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
          className="w-full bg-red-50 text-red-600 py-4 px-6 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Eliminar
        </button>
        <button
          onClick={onEditRoutine}
          className="w-full bg-gray-200 text-gray-800 py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
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

      {(canCompleteWeek || blockDuration) && (
        <div className="mt-6 space-y-3">
          {canCompleteWeek && (
            <button
              onClick={() => onCompleteWeek(routine.mesocycle)}
              className="w-full bg-emerald-50 text-emerald-700 py-3 px-6 rounded-xl font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Terminar semana
            </button>
          )}
          {blockDuration && (
            <button
              onClick={handleResetMesocycle}
              className="w-full bg-indigo-50 text-indigo-700 py-3 px-6 rounded-xl font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Iniciar siguiente mesociclo
            </button>
          )}
        </div>
      )}
    </div>
  );
}