import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const updateRoutineExerciseSchema = z.object({
  order: z.number().int().min(0).optional(),
  targetSets: z.number().int().positive().nullable().optional(),
  targetReps: z.string().trim().max(20).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

type Params = { params: Promise<{ id: string; reId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: routineId, reId } = await params;
    const user = await getCurrentUser();
    const body = updateRoutineExerciseSchema.parse(await req.json());

    const routineExercise = await db.routineExercise.update({
      where: { id: reId, routineId, routine: { userId: user.id } },
      data: body,
      include: { exercise: true },
    });
    return NextResponse.json(routineExercise);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id: routineId, reId } = await params;
    const user = await getCurrentUser();
    await db.routineExercise.delete({
      where: { id: reId, routineId, routine: { userId: user.id } },
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
