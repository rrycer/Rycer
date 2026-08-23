import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";
import { routineInclude } from "@/lib/routine-include";

const createRoutineSchema = z.object({
  name: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(2000).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    const routines = await db.routine.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: routineInclude,
    });
    return NextResponse.json(routines);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = createRoutineSchema.parse(await req.json());
    const routine = await db.routine.create({
      data: { ...body, userId: user.id },
      include: routineInclude,
    });
    return NextResponse.json(routine, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
