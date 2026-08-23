/** Shared `include` shape so every routine response nests its exercises and last-performed date the same way. */
export const routineInclude = {
  exercises: {
    orderBy: { order: "asc" as const },
    include: { exercise: true },
  },
  workouts: {
    where: { completedAt: { not: null } },
    orderBy: { date: "desc" as const },
    take: 1,
    select: { date: true },
  },
};
