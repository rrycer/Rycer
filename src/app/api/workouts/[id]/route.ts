import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";
import { workoutInclude } from "@/lib/workout-include";

const updateWorkoutSchema = z.object({
  date: z.coerce.date().optional(),
  name: z.string().trim().min(1).max(100).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const workout = await db.workout.findUniqueOrThrow({
      where: { id, userId: user.id },
      include: workoutInclude,
    });
    return NextResponse.json(workout);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = updateWorkoutSchema.parse(await req.json());
    const workout = await db.workout.update({
      where: { id, userId: user.id },
      data: body,
      include: workoutInclude,
    });
    return NextResponse.json(workout);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    await db.workout.delete({ where: { id, userId: user.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
