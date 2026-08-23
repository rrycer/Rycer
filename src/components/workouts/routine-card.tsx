"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { apiFetch } from "@/lib/fetcher";
import type { RoutineWithDetails, WorkoutWithDetails } from "@/lib/types";
import Link from "next/link";

export function RoutineCard({ routine }: { routine: RoutineWithDetails }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const summary = routine.exercises.map((re) => re.exercise.name).join(", ");
  const lastPerformed = routine.workouts[0]?.date ?? null;

  async function startWorkout() {
    setStarting(true);
    try {
      await apiFetch<WorkoutWithDetails>(`/api/routines/${routine.id}/start`, {
        method: "POST",
      });
      router.push("/workouts/active");
    } catch (err) {
      setStarting(false);
      alert(err instanceof Error ? err.message : "Couldn't start workout");
    }
  }

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        className="cursor-pointer transition-colors hover:bg-accent"
      >
        <CardContent className="p-4">
          <p className="font-semibold">{routine.name}</p>
          {summary && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{summary}</p>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{routine.name}</SheetTitle>
          </SheetHeader>

          <p className="text-sm text-muted-foreground">
            {lastPerformed
              ? `Last performed: ${formatDistanceToNow(lastPerformed, { addSuffix: true })}`
              : "Never performed"}
          </p>

          <ul className="flex flex-col gap-3 overflow-y-auto">
            {routine.exercises.map((re) => (
              <li key={re.id} className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {re.targetSets ? `${re.targetSets} × ` : ""}
                    {re.exercise.name}
                  </p>
                  {re.exercise.category && (
                    <p className="text-sm text-muted-foreground">{re.exercise.category}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <SheetFooter>
            <Button variant="outline" asChild>
              <Link href={`/routines/${routine.id}/edit`}>Edit template</Link>
            </Button>
            <Button size="lg" onClick={startWorkout} disabled={starting}>
              {starting ? "Starting…" : "Start Workout"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
