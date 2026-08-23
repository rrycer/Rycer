import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { errorResponse } from "@/lib/api";

const updateEntrySchema = z.object({
  weight: z.number().positive().optional(),
  unit: z.enum(["LB", "KG"]).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const body = updateEntrySchema.parse(await req.json());
    const entry = await db.bodyWeightEntry.update({
      where: { id, userId: user.id },
      data: body,
    });
    return NextResponse.json(entry);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    await db.bodyWeightEntry.delete({ where: { id, userId: user.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
