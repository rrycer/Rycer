/** Shared `include` shape so every workout response nests its exercises and sets the same way. */
export const workoutInclude = {
  exercises: {
    orderBy: { order: "asc" as const },
    include: {
      exercise: true,
      sets: { orderBy: { setNumber: "asc" as const } },
    },
  },
};
