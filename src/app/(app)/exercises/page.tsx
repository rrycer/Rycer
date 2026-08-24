import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { ExerciseListView } from "@/components/exercises/exercise-list-view";

export default async function ExercisesPage() {
  const user = await getCurrentUser();
  const exercises = await db.exercise.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return <ExerciseListView exercises={exercises} />;
}
