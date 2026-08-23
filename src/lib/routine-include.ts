/** Shared `include` shape so every routine response nests its exercises the same way. */
export const routineInclude = {
  exercises: {
    orderBy: { order: "asc" as const },
    include: { exercise: true },
  },
};
