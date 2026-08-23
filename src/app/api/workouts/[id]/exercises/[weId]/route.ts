import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const updateWorkoutExerciseSchema = z.object({
  order: z.number().int().min(0).optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

type Params = { params: Promise<{ id: string; weId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: workoutId, weId } = await params;
    const user = await getCurrentUser();
    const body = updateWorkoutExerciseSchema.parse(await req.json());

    const workoutExercise = await db.workoutExercise.update({
      where: { id: weId, workoutId, workout: { userId: user.id } },
      data: body,
      include: { exercise: true, sets: { orderBy: { setNumber: "asc" } } },
    });
    return NextResponse.json(workoutExercise);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: workoutId, weId } = await params;
    const user = await getCurrentUser();
    await db.workoutExercise.delete({
      where: { id: weId, workoutId, workout: { userId: user.id } },
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
