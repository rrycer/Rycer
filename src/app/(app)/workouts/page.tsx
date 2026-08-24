import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { routineInclude } from "@/lib/routine-include";
import { Button } from "@/components/ui/button";
import { QuickStartButton } from "@/components/workouts/quick-start-button";
import { RoutineCard } from "@/components/workouts/routine-card";
import { ActiveWorkoutBanner } from "@/components/workouts/active-workout-banner";

export default async function StartWorkoutPage() {
  const user = await getCurrentUser();

  const [activeWorkout, routines] = await Promise.all([
    db.workout.findFirst({
      where: { userId: user.id, completedAt: null },
      select: { id: true, name: true, date: true },
      orderBy: { date: "desc" },
    }),
    db.routine.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: routineInclude,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-xl font-bold">Start Workout</h1>

      {activeWorkout ? (
        <ActiveWorkoutBanner workout={activeWorkout} />
      ) : (
        <QuickStartButton />
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Templates</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/routines/new">+ Template</Link>
          </Button>
        </div>

        {routines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No templates yet — save a workout plan (like &ldquo;Push Day&rdquo;)
            so you can start it with one tap next time.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {routines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
