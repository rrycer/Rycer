import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { workoutInclude } from "@/lib/workout-include";
import { ActiveWorkoutView } from "@/components/workouts/active-workout-view";

export default async function ActiveWorkoutPage() {
  const user = await getCurrentUser();

  const workout = await db.workout.findFirst({
    where: { userId: user.id, completedAt: null },
    orderBy: { date: "desc" },
    include: workoutInclude,
  });

  if (!workout) redirect("/workouts");

  return <ActiveWorkoutView initialWorkout={workout} />;
}
