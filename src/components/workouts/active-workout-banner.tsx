"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ActiveWorkoutBanner({
  workout,
}: {
  workout: { id: string; name: string | null; date: Date };
}) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            In progress
          </p>
          <p className="font-semibold">{workout.name ?? "Workout"}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/workouts/active">Resume</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
