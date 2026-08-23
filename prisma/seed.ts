import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const DEFAULT_EXERCISES: { name: string; category: string }[] = [
  { name: "Squat (Barbell)", category: "Legs" },
  { name: "Bulgarian Split Squat", category: "Legs" },
  { name: "Leg Extension (Machine)", category: "Legs" },
  { name: "Seated Leg Curl (Machine)", category: "Legs" },
  { name: "Standing Calf Raise (Machine)", category: "Legs" },
  { name: "Leg Press (Machine)", category: "Legs" },
  { name: "Deadlift (Barbell)", category: "Back" },
  { name: "Chin Up", category: "Back" },
  { name: "Pull-Up", category: "Back" },
  { name: "Bent Over One Arm Row (Dumbbell)", category: "Back" },
  { name: "Lat Pulldown (Cable)", category: "Back" },
  { name: "Preacher Curl (Barbell)", category: "Arms" },
  { name: "Hammer Curl (Dumbbell)", category: "Arms" },
  { name: "Incline Curl (Dumbbell)", category: "Arms" },
  { name: "Bench Press (Barbell)", category: "Chest" },
  { name: "Incline Bench Press (Barbell)", category: "Chest" },
  { name: "Chest Dip", category: "Chest" },
  { name: "Skullcrusher (Barbell)", category: "Arms" },
  { name: "Triceps Extension (Dumbbell)", category: "Arms" },
  { name: "Triceps Pushdown (Cable - Straight Bar)", category: "Arms" },
  { name: "Overhead Press (Barbell)", category: "Shoulders" },
  { name: "Reverse Fly (Machine)", category: "Shoulders" },
  { name: "Lateral Raise (Dumbbell)", category: "Shoulders" },
  { name: "Plank", category: "Core" },
];

// Mirrors the user's real Strong templates so the app opens with their
// actual routines instead of made-up ones.
const DEFAULT_ROUTINES: { name: string; exercises: { name: string; targetSets: number }[] }[] = [
  {
    name: "Legs from Tanner",
    exercises: [
      { name: "Squat (Barbell)", targetSets: 3 },
      { name: "Bulgarian Split Squat", targetSets: 3 },
      { name: "Leg Extension (Machine)", targetSets: 3 },
      { name: "Seated Leg Curl (Machine)", targetSets: 3 },
      { name: "Standing Calf Raise (Machine)", targetSets: 3 },
    ],
  },
  {
    name: "Back / Bi",
    exercises: [
      { name: "Chin Up", targetSets: 3 },
      { name: "Bent Over One Arm Row (Dumbbell)", targetSets: 3 },
      { name: "Lat Pulldown (Cable)", targetSets: 3 },
      { name: "Preacher Curl (Barbell)", targetSets: 3 },
      { name: "Hammer Curl (Dumbbell)", targetSets: 3 },
      { name: "Incline Curl (Dumbbell)", targetSets: 3 },
    ],
  },
  {
    name: "Chest / Tri",
    exercises: [
      { name: "Bench Press (Barbell)", targetSets: 4 },
      { name: "Incline Bench Press (Barbell)", targetSets: 3 },
      { name: "Skullcrusher (Barbell)", targetSets: 3 },
      { name: "Triceps Extension (Dumbbell)", targetSets: 3 },
      { name: "Triceps Pushdown (Cable - Straight Bar)", targetSets: 3 },
    ],
  },
  {
    name: "Shoulder/chest",
    exercises: [
      { name: "Bench Press (Barbell)", targetSets: 4 },
      { name: "Overhead Press (Barbell)", targetSets: 3 },
      { name: "Chest Dip", targetSets: 3 },
      { name: "Reverse Fly (Machine)", targetSets: 3 },
      { name: "Lateral Raise (Dumbbell)", targetSets: 3 },
    ],
  },
];

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "brycebyu@gmail.com";

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const exerciseIdByName = new Map<string, string>();
  for (const exercise of DEFAULT_EXERCISES) {
    const row = await db.exercise.upsert({
      where: { userId_name: { userId: user.id, name: exercise.name } },
      update: {},
      create: { ...exercise, userId: user.id },
    });
    exerciseIdByName.set(exercise.name, row.id);
  }

  let routinesCreated = 0;
  for (const routine of DEFAULT_ROUTINES) {
    const existing = await db.routine.findFirst({
      where: { userId: user.id, name: routine.name },
    });
    if (existing) continue;

    await db.routine.create({
      data: {
        userId: user.id,
        name: routine.name,
        exercises: {
          create: routine.exercises.map((re, index) => ({
            exerciseId: exerciseIdByName.get(re.name)!,
            order: index,
            targetSets: re.targetSets,
          })),
        },
      },
    });
    routinesCreated++;
  }

  console.log(
    `Seeded user ${user.email} with ${DEFAULT_EXERCISES.length} exercises and ${routinesCreated} new routines (${DEFAULT_ROUTINES.length - routinesCreated} already existed).`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
