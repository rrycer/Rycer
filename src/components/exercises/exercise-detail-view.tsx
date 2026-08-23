"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/fetcher";
import type { getExerciseHistory } from "@/lib/exercise-history";

type Exercise = { id: string; name: string; category: string | null };

export function ExerciseDetailView({
  exercise,
  history,
}: {
  exercise: Exercise;
  history: Awaited<ReturnType<typeof getExerciseHistory>>;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const chartData = history.trend.map((point) => ({
    date: format(point.date, "MMM d"),
    estimated1RM: Math.round(point.estimated1RM),
  }));

  async function deleteExercise() {
    if (!confirm(`Delete "${exercise.name}"?`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/exercises/${exercise.id}`, { method: "DELETE" });
      router.push("/exercises");
    } catch (err) {
      setDeleting(false);
      alert(err instanceof Error ? err.message : "Couldn't delete exercise");
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-xl font-bold">{exercise.name}</h1>
        {exercise.category && (
          <p className="text-sm text-muted-foreground">{exercise.category}</p>
        )}
      </div>

      {history.personalBest && (
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Personal record
          </p>
          <p className="mt-1 text-lg font-semibold">
            {history.personalBest.weight} × {history.personalBest.reps}
          </p>
          <p className="text-xs text-muted-foreground">
            ~{Math.round(history.personalBest.estimated1RM)} lb estimated 1RM
          </p>
        </div>
      )}

      {chartData.length >= 2 && (
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Estimated 1RM over time
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="estimated1RM"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {history.lastPerformed && (
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Last performed —{" "}
            {format(history.lastPerformed.workout.date, "MMM d, yyyy")}
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {history.lastPerformed.sets.map((set) => (
              <li key={set.id} className="text-sm">
                {set.weight != null && set.reps != null
                  ? `${set.weight} × ${set.reps}`
                  : "—"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!history.lastPerformed && (
        <p className="text-sm text-muted-foreground">
          No history yet — this exercise hasn&rsquo;t been logged in a workout.
        </p>
      )}

      <Button
        variant="ghost"
        className="text-muted-foreground"
        onClick={deleteExercise}
        disabled={deleting}
      >
        {deleting ? "Deleting…" : "Delete exercise"}
      </Button>
    </div>
  );
}
