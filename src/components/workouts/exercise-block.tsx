"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SetRow } from "@/components/workouts/set-row";
import { suggestNextSet } from "@/lib/progression";
import type { ExerciseHistory, WorkoutWithDetails } from "@/lib/types";

type WorkoutExercise = WorkoutWithDetails["exercises"][number];

export function ExerciseBlock({
  workoutExercise,
  history,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onRemoveExercise,
}: {
  workoutExercise: WorkoutExercise;
  history: ExerciseHistory | undefined;
  onAddSet: (prefill: { weight: number | null; reps: number | null }) => void;
  onUpdateSet: (
    setId: string,
    patch: { weight?: number | null; reps?: number | null; completed?: boolean }
  ) => void;
  onDeleteSet: (setId: string) => void;
  onRemoveExercise: () => void;
}) {
  const lastSets = history?.lastPerformed?.sets ?? [];
  const suggestion = suggestNextSet(lastSets);

  function previousLabelFor(setNumber: number) {
    const prior = lastSets[setNumber - 1];
    if (!prior || prior.weight == null || prior.reps == null) return null;
    return `${prior.weight} × ${prior.reps}`;
  }

  function addSet() {
    const priorSet = lastSets[workoutExercise.sets.length];
    onAddSet({
      weight: suggestion?.weight ?? priorSet?.weight ?? null,
      reps: suggestion?.reps ?? priorSet?.reps ?? null,
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{workoutExercise.exercise.name}</p>
          {workoutExercise.exercise.category && (
            <p className="text-xs text-muted-foreground">{workoutExercise.exercise.category}</p>
          )}
        </div>
        <button
          onClick={onRemoveExercise}
          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"
          aria-label="Remove exercise from workout"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {suggestion && (
        <p className="rounded-md bg-secondary px-2 py-1.5 text-xs text-secondary-foreground">
          {suggestion.note}
        </p>
      )}
      {history?.personalBest && (
        <p className="text-xs text-muted-foreground">
          Best: {history.personalBest.weight} × {history.personalBest.reps} (~
          {Math.round(history.personalBest.estimated1RM)} lb 1RM)
        </p>
      )}

      {workoutExercise.sets.length > 0 && (
        <div className="grid grid-cols-[1.5rem_1fr_4.5rem_4.5rem_2.5rem_2rem] gap-2 px-1 text-[11px] font-medium uppercase text-muted-foreground">
          <span className="text-center">Set</span>
          <span>Previous</span>
          <span className="text-center">Weight</span>
          <span className="text-center">Reps</span>
          <span></span>
          <span></span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {workoutExercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            previousLabel={previousLabelFor(set.setNumber)}
            onUpdate={(patch) => onUpdateSet(set.id, patch)}
            onDelete={() => onDeleteSet(set.id)}
          />
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addSet}>
        + Add Set
      </Button>
    </div>
  );
}
