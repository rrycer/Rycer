import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";

/** Turns a caught error into a consistent JSON error response. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request body", issues: err.issues },
      { status: 400 }
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Already exists" },
        { status: 409 }
      );
    }
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Can't delete this — it's still used elsewhere (e.g. logged in a workout)" },
        { status: 409 }
      );
    }
  }

  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
