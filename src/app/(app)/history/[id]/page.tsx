import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { workoutInclude } from "@/lib/workout-include";
import { WorkoutDetailView } from "@/components/history/workout-detail-view";

type Params = { params: Promise<{ id: string }> };

export default async function WorkoutDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();

  const workout = await db.workout.findUnique({
    where: { id, userId: user.id },
    include: workoutInclude,
  });

  if (!workout) notFound();

  return <WorkoutDetailView workout={workout} />;
}
