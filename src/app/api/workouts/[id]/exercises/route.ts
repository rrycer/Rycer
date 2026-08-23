import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const addExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  notes: z.string().trim().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

/** Adds an exercise to a workout, appended after whatever's already there. */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: workoutId } = await params;
    const user = await getCurrentUser();
    const body = addExerciseSchema.parse(await req.json());

    const workoutExercise = await db.$transaction(async (tx) => {
      // Ownership checks: both the workout and the exercise must belong to
      // the current user, otherwise this throws and nothing is created.
      await tx.workout.findUniqueOrThrow({
        where: { id: workoutId, userId: user.id },
      });
      await tx.exercise.findUniqueOrThrow({
        where: { id: body.exerciseId, userId: user.id },
      });

      const count = await tx.workoutExercise.count({ where: { workoutId } });

      return tx.workoutExercise.create({
        data: {
          workoutId,
          exerciseId: body.exerciseId,
          notes: body.notes,
          order: count,
        },
        include: { exercise: true, sets: true },
      });
    });

    return NextResponse.json(workoutExercise, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
