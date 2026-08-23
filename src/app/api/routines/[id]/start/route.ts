import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";
import { workoutInclude } from "@/lib/workout-include";

type Params = { params: Promise<{ id: string }> };

/**
 * Instantiates a new (empty) Workout from a Routine: same name, exercises
 * copied over in order with no sets logged yet — the user fills those in
 * as they train.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id: routineId } = await params;
    const user = await getCurrentUser();

    const workout = await db.$transaction(async (tx) => {
      const routine = await tx.routine.findUniqueOrThrow({
        where: { id: routineId, userId: user.id },
        include: { exercises: { orderBy: { order: "asc" } } },
      });

      return tx.workout.create({
        data: {
          userId: user.id,
          name: routine.name,
          exercises: {
            create: routine.exercises.map((re) => ({
              exerciseId: re.exerciseId,
              order: re.order,
              notes: re.notes,
            })),
          },
        },
        include: workoutInclude,
      });
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
