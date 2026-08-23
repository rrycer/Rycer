import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { workoutInclude } from "@/lib/workout-include";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default async function HistoryPage() {
  const user = await getCurrentUser();

  const workouts = await db.workout.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { date: "desc" },
    include: workoutInclude,
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">History</h1>

      {workouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Finished workouts will show up here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((workout) => {
            const totalSets = workout.exercises.reduce((n, we) => n + we.sets.length, 0);
            const exerciseNames = workout.exercises.map((we) => we.exercise.name).join(", ");

            return (
              <Link key={workout.id} href={`/history/${workout.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="p-4">
                    <div className="flex items-baseline justify-between">
                      <p className="font-semibold">{workout.name ?? "Workout"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(workout.date, "MMM d, yyyy")}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {workout.exercises.length} exercises · {totalSets} sets
                    </p>
                    {exerciseNames && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {exerciseNames}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
