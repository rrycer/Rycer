import { Prisma } from "@/generated/prisma/client";
import { workoutInclude } from "@/lib/workout-include";
import { routineInclude } from "@/lib/routine-include";

export type WorkoutWithDetails = Prisma.WorkoutGetPayload<{
  include: typeof workoutInclude;
}>;

export type RoutineWithDetails = Prisma.RoutineGetPayload<{
  include: typeof routineInclude;
}>;

export type ExerciseHistory = {
  lastPerformed:
    | (Prisma.WorkoutExerciseGetPayload<{
        include: {
          sets: true;
          workout: { select: { id: true; date: true; name: true } };
        };
      }>)
    | null;
  personalBest: {
    weight: number;
    reps: number;
    estimated1RM: number;
    achievedAt: string;
  } | null;
  trend: { date: string; weight: number; reps: number; estimated1RM: number }[];
};
