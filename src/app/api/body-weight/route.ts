import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const createEntrySchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(["LB", "KG"]).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    const entries = await db.bodyWeightEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(entries);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = createEntrySchema.parse(await req.json());
    const entry = await db.bodyWeightEntry.create({
      data: { ...body, userId: user.id },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
