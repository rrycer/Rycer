import { db } from "@/lib/db";

/**
 * This app is single-user for now (no auth yet), so "the current user" is
 * just the one row seeded by `prisma/seed.ts`. Every API route calls this
 * instead of hardcoding an id, so swapping in real auth later only means
 * changing this one function.
 */
export async function getCurrentUser() {
  const user = await db.user.findFirst();
  if (!user) {
    throw new Error(
      "No user found — run `npm run db:seed` to create the initial user."
    );
  }
  return user;
}
