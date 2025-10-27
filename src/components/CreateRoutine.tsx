import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Routine, Exercise } from '../types';
import { generateId } from '../utils/storage';

interface CreateRoutineProps {
  routine?: Routine;
  availableMesocycles: string[];
  onSave: (routine: Routine) => void;
  onCancel: () => void;
}

export function CreateRoutine({ routine, availableMesocycles, onSave, onCancel }: CreateRoutineProps) {
  const [routineName, setRoutineName] = useState('');
  const [mesocycle, setMesocycle] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (routine) {
      setRoutineName(routine.name);
      setMesocycle(routine.mesocycle);
      setExercises(routine.exercises);
    }
  }, [routine]);

  useEffect(() => {
    if (!routine && !mesocycle && availableMesocycles.length > 0) {
      setMesocycle(availableMesocycles[0]);
    }
  }, [routine, mesocycle, availableMesocycles]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: generateId(),
      name: '',
      sets: [{ weight: 0, reps: 0 }],
      technique: '',
      repRange: '',
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, name } : ex
    ));
  };

  const updateExerciseTechnique = (exerciseId: string, technique: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, technique } : ex
    ));
  };

  const updateExerciseRepRange = (exerciseId: string, repRange: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, repRange } : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 0 }] }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets.map((set, index) =>
              index === setIndex ? { ...set, [field]: value } : set
            )
          }
        : ex
    ));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter((_, index) => index !== setIndex) }
        : ex
    ));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleSave = () => {
    if (!routineName.trim()) {
      alert('Por favor, ingresa un nombre para la rutina');
      return;
    }

    if (exercises.length === 0) {
      alert('Por favor, añade al menos un ejercicio');
      return;
    }

    const hasEmptyExercises = exercises.some(ex => !ex.name.trim());
    if (hasEmptyExercises) {
      alert('Por favor, ingresa nombres para todos los ejercicios');
      return;
    }

    const newRoutine: Routine = {
      id: routine?.id || generateId(),
      name: routineName,
      mesocycle: mesocycle.trim() || 'General',
      exercises,
      createdAt: routine?.createdAt || new Date().toISOString(),
    };

    onSave(newRoutine);
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mesociclo
        </label>
        <input
          type="text"
          value={mesocycle}
          onChange={(e) => setMesocycle(e.target.value)}
          list="mesocycle-options"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Mesociclo 1"
        />
        <datalist id="mesocycle-options">
          {availableMesocycles.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la Rutina
        </label>
        <input
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Pecho y Tríceps"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ejercicios</h3>
          <button
            onClick={addExercise}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Ejercicio
          </button>
        </div>

        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-3"
                  placeholder="Nombre del ejercicio"
                />
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Nuevos campos para técnica y rango de reps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Técnica última serie
                  </label>
                  <input
                    type="text"
                    value={exercise.technique || ''}
                    onChange={(e) => updateExerciseTechnique(exercise.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Ej: Al Fallo, Parciales, Myo-Reps"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Rango de reps esperadas
                  </label>
                  <input
                    type="text"
                    value={exercise.repRange || ''}
                    onChange={(e) => updateExerciseRepRange(exercise.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Ej: 8-12, 15-20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 w-8">
                      {setIndex + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, setIndex, 'weight', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">kg</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exercise.id, setIndex, 'reps', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">reps</span>
                    </div>
                    {exercise.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(exercise.id, setIndex)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(exercise.id)}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir una serie
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}