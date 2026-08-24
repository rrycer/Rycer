import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  passcodeMatches,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

const loginSchema = z.object({ passcode: z.string().min(1) });

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    console.error("APP_PASSCODE is not set — refusing all logins");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!passcodeMatches(parsed.data.passcode, expected)) {
    // A small delay slows down naive brute-force attempts; it's not a
    // substitute for a long, random passcode, which is the real defense.
    await delay(400);
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
