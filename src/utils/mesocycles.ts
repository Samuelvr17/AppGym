import { MesocycleConfig, MesocycleProgress, Routine, Workout } from '../types';

export function getMesocycleSequence(mesocycleName: string, routines: Routine[]): Routine[] {
  return routines
    .filter((routine) => routine.mesocycle === mesocycleName)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function calculateMesocycleProgress(
  mesocycleName: string,
  routines: Routine[],
  workouts: Workout[],
  config?: MesocycleConfig
): MesocycleProgress {
  const sequence = getMesocycleSequence(mesocycleName, routines);
  const totalRoutines = sequence.length;
  const weekOffset = config?.weekOffset ?? 0;
  const plannedWeeks = config?.durationWeeks ?? 0;
  const completedWeeksInCycle = config?.completedWeeksInCycle ?? 0;
  const displayTotalWeeks = plannedWeeks + weekOffset;

  const baseProgress: MesocycleProgress = {
    weeksCompleted: completedWeeksInCycle,
    currentWeekNumber:
      weekOffset + completedWeeksInCycle + (totalRoutines > 0 ? 1 : 0),
    displayTotalWeeks,
    totalRoutines,
    completedRoutineIds: [],
    remainingRoutineIds: sequence.map((routine) => routine.id),
    lastRoutineId: undefined,
    isWeekComplete: false,
    isMesocycleComplete:
      plannedWeeks > 0 && completedWeeksInCycle >= plannedWeeks,
  };

  if (totalRoutines === 0) {
    return baseProgress;
  }

  if (!config || !config.startDate) {
    return baseProgress;
  }

  const startTime = new Date(config.startDate).getTime();
  if (Number.isNaN(startTime)) {
    return baseProgress;
  }

  const routineIds = new Set(sequence.map((routine) => routine.id));

  const relevantWorkouts = workouts
    .filter((workout) => routineIds.has(workout.routineId))
    .filter((workout) => new Date(workout.date).getTime() >= startTime)
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  if (relevantWorkouts.length === 0) {
    return baseProgress;
  }

  const completedSet = new Set<string>();
  const sortedSequenceIds = sequence.map((routine) => routine.id);
  let lastRoutineId: string | undefined;

  for (const workout of relevantWorkouts) {
    completedSet.add(workout.routineId);
    lastRoutineId = workout.routineId;
  }

  const completedRoutineIds = sortedSequenceIds.filter((id) =>
    completedSet.has(id)
  );
  const remainingRoutineIds = sortedSequenceIds.filter(
    (id) => !completedSet.has(id)
  );

  const isWeekComplete = remainingRoutineIds.length === 0 && totalRoutines > 0;
  const isMesocycleComplete =
    baseProgress.isMesocycleComplete ||
    (plannedWeeks > 0 && isWeekComplete && completedWeeksInCycle + 1 >= plannedWeeks);

  return {
    ...baseProgress,
    completedRoutineIds,
    remainingRoutineIds,
    lastRoutineId,
    isWeekComplete,
    isMesocycleComplete,
  };
}
