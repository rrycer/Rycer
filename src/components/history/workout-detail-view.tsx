"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/fetcher";
import type { WorkoutWithDetails } from "@/lib/types";

export function WorkoutDetailView({ workout }: { workout: WorkoutWithDetails }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function updateSet(
    weId: string,
    setId: string,
    patch: { weight?: number | null; reps?: number | null }
  ) {
    await apiFetch(`/api/workouts/${workout.id}/exercises/${weId}/sets/${setId}`, {
      method: "PATCH",
      body: patch,
    });
    router.refresh();
  }

  async function deleteWorkout() {
    if (!confirm("Delete this workout? This can't be undone.")) return;
    setDeleting(true);
    await apiFetch(`/api/workouts/${workout.id}`, { method: "DELETE" });
    router.push("/history");
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-xl font-bold">{workout.name ?? "Workout"}</h1>
        <p className="text-sm text-muted-foreground">
          {format(workout.date, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {workout.notes && <p className="text-sm">{workout.notes}</p>}

      <div className="flex flex-col gap-3">
        {workout.exercises.map((we) => (
          <div key={we.id} className="rounded-lg border border-border p-3">
            <p className="font-semibold">{we.exercise.name}</p>
            {we.exercise.category && (
              <p className="text-xs text-muted-foreground">{we.exercise.category}</p>
            )}

            {we.sets.length > 0 && (
              <div className="mt-2 grid grid-cols-[1.5rem_1fr_1fr_2.5rem] gap-2 px-1 text-[11px] font-medium uppercase text-muted-foreground">
                <span className="text-center">Set</span>
                <span className="text-center">Weight</span>
                <span className="text-center">Reps</span>
                <span></span>
              </div>
            )}

            <div className="mt-1 flex flex-col gap-1">
              {we.sets.map((set) => (
                <SetEditRow key={set.id} set={set} onUpdate={(patch) => updateSet(we.id, set.id, patch)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="text-muted-foreground" onClick={deleteWorkout} disabled={deleting}>
        {deleting ? "Deleting…" : "Delete workout"}
      </Button>
    </div>
  );
}

function SetEditRow({
  set,
  onUpdate,
}: {
  set: WorkoutWithDetails["exercises"][number]["sets"][number];
  onUpdate: (patch: { weight?: number | null; reps?: number | null }) => void;
}) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");

  return (
    <div className="grid grid-cols-[1.5rem_1fr_1fr_2.5rem] items-center gap-2 px-1 py-0.5">
      <span className="text-center text-sm font-medium text-muted-foreground">
        {set.setNumber}
      </span>
      <Input
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={() => {
          const parsed = weight === "" ? null : Number(weight);
          if (parsed !== set.weight) onUpdate({ weight: parsed });
        }}
        className="h-9 px-2 text-center"
      />
      <Input
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => {
          const parsed = reps === "" ? null : Number(reps);
          if (parsed !== set.reps) onUpdate({ reps: parsed });
        }}
        className="h-9 px-2 text-center"
      />
      <span className="text-center text-xs text-muted-foreground">
        {set.completed ? "✓" : ""}
      </span>
    </div>
  );
}
