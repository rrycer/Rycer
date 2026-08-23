import { db } from "@/lib/db";

// Epley formula: a standard estimate of 1-rep max from a submaximal set.
function estimate1RM(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

/**
 * What you did last time for an exercise (to show while logging the next
 * set), your all-time best set, and one point per completed session for
 * charting progress over time. Shared by the API route and the exercise
 * detail page so the logic lives in one place.
 */
export async function getExerciseHistory(
  userId: string,
  exerciseId: string,
  excludeWorkoutId?: string | null
) {
  const [lastPerformed, allSets, sessions] = await Promise.all([
    db.workoutExercise.findFirst({
      where: {
        exerciseId,
        workout: {
          userId,
          ...(excludeWorkoutId ? { id: { not: excludeWorkoutId } } : {}),
        },
      },
      orderBy: { workout: { date: "desc" } },
      include: {
        sets: { orderBy: { setNumber: "asc" } },
        workout: { select: { id: true, date: true, name: true } },
      },
    }),
    db.workoutSet.findMany({
      where: {
        workoutExercise: { exerciseId, workout: { userId } },
        weight: { not: null },
        reps: { not: null },
      },
      select: { weight: true, reps: true, createdAt: true },
    }),
    db.workoutExercise.findMany({
      where: {
        exerciseId,
        workout: { userId, completedAt: { not: null } },
      },
      orderBy: { workout: { date: "asc" } },
      include: {
        sets: { where: { weight: { not: null }, reps: { not: null } } },
        workout: { select: { date: true } },
      },
    }),
  ]);

  let personalBest: {
    weight: number;
    reps: number;
    estimated1RM: number;
    achievedAt: Date;
  } | null = null;

  for (const set of allSets) {
    if (set.weight == null || set.reps == null) continue;
    const estimated1RM = estimate1RM(set.weight, set.reps);
    if (!personalBest || estimated1RM > personalBest.estimated1RM) {
      personalBest = {
        weight: set.weight,
        reps: set.reps,
        estimated1RM,
        achievedAt: set.createdAt,
      };
    }
  }

  const trend = sessions
    .map((session) => {
      let best: { weight: number; reps: number; estimated1RM: number } | null = null;
      for (const set of session.sets) {
        if (set.weight == null || set.reps == null) continue;
        const estimated1RM = estimate1RM(set.weight, set.reps);
        if (!best || estimated1RM > best.estimated1RM) {
          best = { weight: set.weight, reps: set.reps, estimated1RM };
        }
      }
      return best && { date: session.workout.date, ...best };
    })
    .filter((point): point is NonNullable<typeof point> => point != null);

  return { lastPerformed, personalBest, trend };
}
