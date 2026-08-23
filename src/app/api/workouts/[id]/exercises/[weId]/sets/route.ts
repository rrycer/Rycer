import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const addSetSchema = z.object({
  weight: z.number().nonnegative().optional(),
  unit: z.enum(["LB", "KG"]).optional(),
  reps: z.number().int().nonnegative().optional(),
  isWarmup: z.boolean().optional(),
  completed: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string; weId: string }> };

/** Appends a new set to a workout exercise. */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: workoutId, weId } = await params;
    const user = await getCurrentUser();
    const body = addSetSchema.parse(await req.json());

    const set = await db.$transaction(async (tx) => {
      await tx.workoutExercise.findUniqueOrThrow({
        where: { id: weId, workoutId, workout: { userId: user.id } },
      });

      const count = await tx.workoutSet.count({
        where: { workoutExerciseId: weId },
      });

      return tx.workoutSet.create({
        data: { ...body, workoutExerciseId: weId, setNumber: count + 1 },
      });
    });

    return NextResponse.json(set, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
