import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const addRoutineExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  targetSets: z.number().int().positive().optional(),
  targetReps: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

/** Adds an exercise to a routine, appended after whatever's already there. */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: routineId } = await params;
    const user = await getCurrentUser();
    const body = addRoutineExerciseSchema.parse(await req.json());

    const routineExercise = await db.$transaction(async (tx) => {
      await tx.routine.findUniqueOrThrow({
        where: { id: routineId, userId: user.id },
      });
      await tx.exercise.findUniqueOrThrow({
        where: { id: body.exerciseId, userId: user.id },
      });

      const count = await tx.routineExercise.count({ where: { routineId } });

      return tx.routineExercise.create({
        data: { ...body, routineId, order: count },
        include: { exercise: true },
      });
    });

    return NextResponse.json(routineExercise, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
