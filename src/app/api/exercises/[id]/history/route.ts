import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// Epley formula: a standard estimate of 1-rep max from a submaximal set.
function estimate1RM(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

/**
 * Returns what you did last time for this exercise (to show while logging
 * the next set) and your all-time best set, so progress is visible without
 * digging through workout history.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: exerciseId } = await params;
    const user = await getCurrentUser();
    const excludeWorkoutId = req.nextUrl.searchParams.get("excludeWorkoutId");

    await db.exercise.findUniqueOrThrow({
      where: { id: exerciseId, userId: user.id },
    });

    const [lastPerformed, allSets] = await Promise.all([
      db.workoutExercise.findFirst({
        where: {
          exerciseId,
          workout: {
            userId: user.id,
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
          workoutExercise: { exerciseId, workout: { userId: user.id } },
          weight: { not: null },
          reps: { not: null },
        },
        select: { weight: true, reps: true, createdAt: true },
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

    return NextResponse.json({ lastPerformed, personalBest });
  } catch (err) {
    return errorResponse(err);
  }
}
