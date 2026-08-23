"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddExerciseSheet } from "@/components/workouts/add-exercise-sheet";
import { apiFetch } from "@/lib/fetcher";
import type { RoutineWithDetails } from "@/lib/types";

export function RoutineEditView({ routine: initialRoutine }: { routine: RoutineWithDetails }) {
  const router = useRouter();
  const [routine, setRoutine] = useState(initialRoutine);
  const [name, setName] = useState(routine.name);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    const fresh = await apiFetch<RoutineWithDetails>(`/api/routines/${routine.id}`);
    setRoutine(fresh);
  }

  async function commitName() {
    if (name === routine.name) return;
    await apiFetch(`/api/routines/${routine.id}`, { method: "PATCH", body: { name } });
  }

  async function addExercise(exerciseId: string) {
    setAddExerciseOpen(false);
    await apiFetch(`/api/routines/${routine.id}/exercises`, {
      method: "POST",
      body: { exerciseId },
    });
    await refresh();
  }

  async function updateExercise(
    reId: string,
    patch: { targetSets?: number | null; targetReps?: string | null; order?: number }
  ) {
    await apiFetch(`/api/routines/${routine.id}/exercises/${reId}`, {
      method: "PATCH",
      body: patch,
    });
    await refresh();
  }

  async function removeExercise(reId: string) {
    await apiFetch(`/api/routines/${routine.id}/exercises/${reId}`, { method: "DELETE" });
    await refresh();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= routine.exercises.length) return;
    const a = routine.exercises[index];
    const b = routine.exercises[target];
    await Promise.all([
      apiFetch(`/api/routines/${routine.id}/exercises/${a.id}`, {
        method: "PATCH",
        body: { order: b.order },
      }),
      apiFetch(`/api/routines/${routine.id}/exercises/${b.id}`, {
        method: "PATCH",
        body: { order: a.order },
      }),
    ]);
    await refresh();
  }

  async function deleteRoutine() {
    if (!confirm(`Delete "${routine.name}"? This can't be undone.`)) return;
    setDeleting(true);
    await apiFetch(`/api/routines/${routine.id}`, { method: "DELETE" });
    router.push("/workouts");
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitName}
        className="border-none px-0 text-xl font-bold shadow-none focus-visible:ring-0"
      />

      <div className="flex flex-col gap-2">
        {routine.exercises.map((re, index) => (
          <div key={re.id} className="flex items-center gap-2 rounded-lg border border-border p-3">
            <div className="flex flex-col">
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="text-muted-foreground disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === routine.exercises.length - 1}
                className="text-muted-foreground disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="size-4" />
              </button>
            </div>

            <div className="flex-1">
              <p className="font-medium">{re.exercise.name}</p>
              {re.exercise.category && (
                <p className="text-xs text-muted-foreground">{re.exercise.category}</p>
              )}
            </div>

            <Input
              inputMode="numeric"
              defaultValue={re.targetSets ?? ""}
              placeholder="sets"
              onBlur={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                if (v !== re.targetSets) updateExercise(re.id, { targetSets: v });
              }}
              className="h-9 w-16 px-2 text-center"
            />
            <Input
              defaultValue={re.targetReps ?? ""}
              placeholder="reps"
              onBlur={(e) => {
                const v = e.target.value === "" ? null : e.target.value;
                if (v !== re.targetReps) updateExercise(re.id, { targetReps: v });
              }}
              className="h-9 w-16 px-2 text-center"
            />

            <button
              onClick={() => removeExercise(re.id)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove exercise"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={() => setAddExerciseOpen(true)}>
        + Add Exercise
      </Button>

      <Button variant="ghost" className="text-muted-foreground" onClick={deleteRoutine} disabled={deleting}>
        {deleting ? "Deleting…" : "Delete template"}
      </Button>

      <AddExerciseSheet
        open={addExerciseOpen}
        onOpenChange={setAddExerciseOpen}
        onSelect={addExercise}
      />
    </div>
  );
}
