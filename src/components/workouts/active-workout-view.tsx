"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseBlock } from "@/components/workouts/exercise-block";
import { AddExerciseSheet } from "@/components/workouts/add-exercise-sheet";
import { RestTimer } from "@/components/workouts/rest-timer";
import { LiveDuration } from "@/components/workouts/live-duration";
import { apiFetch } from "@/lib/fetcher";
import { formatVolume, totalVolume } from "@/lib/workout-stats";
import type { ExerciseHistory, WorkoutWithDetails } from "@/lib/types";

export function ActiveWorkoutView({
  initialWorkout,
}: {
  initialWorkout: WorkoutWithDetails;
}) {
  const router = useRouter();
  const [workout, setWorkout] = useState(initialWorkout);
  const [history, setHistory] = useState<Record<string, ExerciseHistory>>({});
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [restTimerKey, setRestTimerKey] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [name, setName] = useState(workout.name ?? "");

  const exerciseIds = workout.exercises.map((we) => we.exerciseId);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      exerciseIds.map((id) =>
        apiFetch<ExerciseHistory>(
          `/api/exercises/${id}/history?excludeWorkoutId=${workout.id}`
        ).then((h) => [id, h] as const)
      )
    ).then((entries) => {
      if (cancelled) return;
      setHistory(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
    // Only refetch when the set of exercises in the workout changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseIds.join(",")]);

  async function refreshWorkout() {
    const fresh = await apiFetch<WorkoutWithDetails>(`/api/workouts/${workout.id}`);
    setWorkout(fresh);
  }

  async function handleAddSet(weId: string, prefill: { weight: number | null; reps: number | null }) {
    await apiFetch(`/api/workouts/${workout.id}/exercises/${weId}/sets`, {
      method: "POST",
      // New sets start unchecked — the lifter hasn't done them yet, even
      // though we prefill the target weight/reps as a suggestion.
      body: { ...prefill, completed: false },
    });
    await refreshWorkout();
  }

  async function handleUpdateSet(
    weId: string,
    setId: string,
    patch: { weight?: number | null; reps?: number | null; completed?: boolean }
  ) {
    await apiFetch(`/api/workouts/${workout.id}/exercises/${weId}/sets/${setId}`, {
      method: "PATCH",
      body: patch,
    });
    if (patch.completed) {
      setRestTimerKey((k) => k + 1);
      setShowRestTimer(true);
    }
    await refreshWorkout();
  }

  async function handleDeleteSet(weId: string, setId: string) {
    await apiFetch(`/api/workouts/${workout.id}/exercises/${weId}/sets/${setId}`, {
      method: "DELETE",
    });
    await refreshWorkout();
  }

  async function handleRemoveExercise(weId: string) {
    await apiFetch(`/api/workouts/${workout.id}/exercises/${weId}`, { method: "DELETE" });
    await refreshWorkout();
  }

  async function handleAddExercise(exerciseId: string) {
    setAddExerciseOpen(false);
    await apiFetch(`/api/workouts/${workout.id}/exercises`, {
      method: "POST",
      body: { exerciseId },
    });
    await refreshWorkout();
  }

  async function commitName() {
    if (name === (workout.name ?? "")) return;
    await apiFetch(`/api/workouts/${workout.id}`, {
      method: "PATCH",
      body: { name: name || null },
    });
  }

  async function finishWorkout() {
    setFinishing(true);
    try {
      await apiFetch(`/api/workouts/${workout.id}`, {
        method: "PATCH",
        body: { completedAt: new Date().toISOString() },
      });
      router.push(`/history/${workout.id}`);
    } catch (err) {
      setFinishing(false);
      alert(err instanceof Error ? err.message : "Couldn't finish workout");
    }
  }

  async function discardWorkout() {
    if (!confirm("Discard this workout? This can't be undone.")) return;
    await apiFetch(`/api/workouts/${workout.id}`, { method: "DELETE" });
    router.push("/workouts");
  }

  const volume = totalVolume(workout.exercises);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitName}
        placeholder="Workout name"
        className="border-none px-0 text-xl font-bold shadow-none focus-visible:ring-0"
      />

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          {/* workout.date may be a string after a refetch (JSON) rather than
              the Date instance the initial server render passes — normalize. */}
          Duration: <LiveDuration since={new Date(workout.date)} />
        </span>
        <span>Volume: {formatVolume(volume)}</span>
      </div>

      <div className="flex flex-col gap-3">
        {workout.exercises.map((we) => (
          <ExerciseBlock
            key={we.id}
            workoutExercise={we}
            history={history[we.exerciseId]}
            onAddSet={(prefill) => handleAddSet(we.id, prefill)}
            onUpdateSet={(setId, patch) => handleUpdateSet(we.id, setId, patch)}
            onDeleteSet={(setId) => handleDeleteSet(we.id, setId)}
            onRemoveExercise={() => handleRemoveExercise(we.id)}
          />
        ))}
      </div>

      <Button variant="outline" onClick={() => setAddExerciseOpen(true)}>
        + Add Exercise
      </Button>

      <div className="mt-2 flex flex-col gap-2">
        <Button size="lg" onClick={finishWorkout} disabled={finishing}>
          {finishing ? "Finishing…" : "Finish Workout"}
        </Button>
        <Button variant="ghost" className="text-muted-foreground" onClick={discardWorkout}>
          Discard workout
        </Button>
      </div>

      <AddExerciseSheet
        open={addExerciseOpen}
        onOpenChange={setAddExerciseOpen}
        onSelect={handleAddExercise}
      />

      {showRestTimer && (
        <RestTimer key={restTimerKey} onDismiss={() => setShowRestTimer(false)} />
      )}
    </div>
  );
}
