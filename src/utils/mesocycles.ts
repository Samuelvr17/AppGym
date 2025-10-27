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

  const baseProgress: MesocycleProgress = {
    weeksCompleted: 0,
    currentWeekNumber: totalRoutines > 0 ? 1 : 0,
    currentSequenceIndex: 0,
    totalRoutines,
    lastRoutineId: undefined,
    nextRoutineId: sequence[0]?.id,
    isWeekComplete: false,
    isMesocycleComplete: false,
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

  const indexByRoutineId = new Map<string, number>();
  sequence.forEach((routine, index) => {
    indexByRoutineId.set(routine.id, index);
  });

  const relevantWorkouts = workouts
    .filter((workout) => indexByRoutineId.has(workout.routineId))
    .filter((workout) => new Date(workout.date).getTime() >= startTime)
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  if (relevantWorkouts.length === 0) {
    return baseProgress;
  }

  let weeksCompleted = 0;
  let pointer = 0;
  let isWeekComplete = false;
  let lastRoutineId: string | undefined;
  let lastRoutineIndex: number | undefined;

  for (const workout of relevantWorkouts) {
    const routineIndex = indexByRoutineId.get(workout.routineId);
    if (routineIndex === undefined) {
      continue;
    }

    if (routineIndex === pointer) {
      pointer += 1;
      lastRoutineId = workout.routineId;
      if (pointer === totalRoutines) {
        weeksCompleted += 1;
        pointer = 0;
        isWeekComplete = true;
      } else {
        isWeekComplete = false;
      }
    } else {
      const wasLastRoutine = lastRoutineIndex !== undefined && routineIndex === lastRoutineIndex;
      if (wasLastRoutine) {
        // Repetir la misma rutina no avanza la secuencia
        lastRoutineId = workout.routineId;
        isWeekComplete = false;
      } else {
        pointer = (routineIndex + 1) % totalRoutines;
        lastRoutineId = workout.routineId;
        isWeekComplete = false;
      }
    }

    lastRoutineIndex = routineIndex;
  }

  const baseWeek = isWeekComplete ? weeksCompleted : weeksCompleted + 1;
  const safeWeek = Math.max(baseWeek, 1);
  const plannedWeeks = config.durationWeeks ?? 0;
  const currentWeekNumber =
    plannedWeeks > 0 ? Math.min(safeWeek, plannedWeeks) : safeWeek;

  const nextRoutineId = sequence[pointer]?.id ?? sequence[0]?.id;

  const isMesocycleComplete =
    plannedWeeks > 0 && weeksCompleted >= plannedWeeks && isWeekComplete;

  return {
    weeksCompleted,
    currentWeekNumber,
    currentSequenceIndex: pointer,
    totalRoutines,
    lastRoutineId,
    nextRoutineId,
    isWeekComplete,
    isMesocycleComplete,
  };
}
