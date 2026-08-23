import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";
import { getExerciseHistory } from "@/lib/exercise-history";

type Params = { params: Promise<{ id: string }> };

/**
 * Returns what you did last time for this exercise (to show while logging
 * the next set), your all-time best set, and a session-by-session trend
 * for charting — so progress is visible without digging through history.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: exerciseId } = await params;
    const user = await getCurrentUser();
    const excludeWorkoutId = req.nextUrl.searchParams.get("excludeWorkoutId");

    await db.exercise.findUniqueOrThrow({
      where: { id: exerciseId, userId: user.id },
    });

    const history = await getExerciseHistory(user.id, exerciseId, excludeWorkoutId);
    return NextResponse.json(history);
  } catch (err) {
    return errorResponse(err);
  }
}
