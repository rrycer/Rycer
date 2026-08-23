import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";
import { routineInclude } from "@/lib/routine-include";

const updateRoutineSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const routine = await db.routine.findUniqueOrThrow({
      where: { id, userId: user.id },
      include: routineInclude,
    });
    return NextResponse.json(routine);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = updateRoutineSchema.parse(await req.json());
    const routine = await db.routine.update({
      where: { id, userId: user.id },
      data: body,
      include: routineInclude,
    });
    return NextResponse.json(routine);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    await db.routine.delete({ where: { id, userId: user.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
