import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";
import { workoutInclude } from "@/lib/workout-include";

const createWorkoutSchema = z.object({
  date: z.coerce.date().optional(),
  name: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const status = req.nextUrl.searchParams.get("status"); // "active" | "completed"

    const workouts = await db.workout.findMany({
      where: {
        userId: user.id,
        ...(status === "active" && { completedAt: null }),
        ...(status === "completed" && { completedAt: { not: null } }),
      },
      orderBy: { date: "desc" },
      include: workoutInclude,
    });
    return NextResponse.json(workouts);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = createWorkoutSchema.parse(await req.json());
    const workout = await db.workout.create({
      data: { ...body, userId: user.id },
      include: workoutInclude,
    });
    return NextResponse.json(workout, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
