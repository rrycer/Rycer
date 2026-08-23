import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { getExerciseHistory } from "@/lib/exercise-history";
import { ExerciseDetailView } from "@/components/exercises/exercise-detail-view";

type Params = { params: Promise<{ id: string }> };

export default async function ExerciseDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();

  const exercise = await db.exercise.findUnique({
    where: { id, userId: user.id },
  });
  if (!exercise) notFound();

  const history = await getExerciseHistory(user.id, id);

  return <ExerciseDetailView exercise={exercise} history={history} />;
}
