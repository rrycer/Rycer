import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const updateSetSchema = z.object({
  weight: z.number().nonnegative().nullable().optional(),
  unit: z.enum(["LB", "KG"]).optional(),
  reps: z.number().int().nonnegative().nullable().optional(),
  isWarmup: z.boolean().optional(),
  completed: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string; weId: string; setId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: workoutId, weId, setId } = await params;
    const user = await getCurrentUser();
    const body = updateSetSchema.parse(await req.json());

    const set = await db.workoutSet.update({
      where: {
        id: setId,
        workoutExerciseId: weId,
        workoutExercise: { workoutId, workout: { userId: user.id } },
      },
      data: body,
    });
    return NextResponse.json(set);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: workoutId, weId, setId } = await params;
    const user = await getCurrentUser();
    await db.workoutSet.delete({
      where: {
        id: setId,
        workoutExerciseId: weId,
        workoutExercise: { workoutId, workout: { userId: user.id } },
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
