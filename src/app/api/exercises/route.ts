import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const createExerciseSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    const exercises = await db.exercise.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(exercises);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = createExerciseSchema.parse(await req.json());
    const exercise = await db.exercise.create({
      data: { ...body, userId: user.id },
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
