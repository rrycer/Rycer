import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const DEFAULT_EXERCISES: { name: string; category: string }[] = [
  { name: "Barbell Back Squat", category: "Legs" },
  { name: "Barbell Bench Press", category: "Chest" },
  { name: "Barbell Deadlift", category: "Back" },
  { name: "Overhead Press", category: "Shoulders" },
  { name: "Barbell Row", category: "Back" },
  { name: "Pull-Up", category: "Back" },
  { name: "Dumbbell Bicep Curl", category: "Arms" },
  { name: "Tricep Pushdown", category: "Arms" },
  { name: "Leg Press", category: "Legs" },
  { name: "Plank", category: "Core" },
];

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "brycebyu@gmail.com";

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  for (const exercise of DEFAULT_EXERCISES) {
    await db.exercise.upsert({
      where: { userId_name: { userId: user.id, name: exercise.name } },
      update: {},
      create: { ...exercise, userId: user.id },
    });
  }

  console.log(`Seeded user ${user.email} with ${DEFAULT_EXERCISES.length} default exercises.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
