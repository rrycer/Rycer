type SetLike = { weight: number | null; reps: number | null; completed: boolean };
type ExerciseLike = { sets: SetLike[] };

/** Total pounds lifted: sum of weight × reps across completed sets only. */
export function totalVolume(exercises: ExerciseLike[]): number {
  let total = 0;
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (!set.completed || set.weight == null || set.reps == null) continue;
      total += set.weight * set.reps;
    }
  }
  return total;
}

export function formatVolume(lb: number): string {
  return `${Math.round(lb).toLocaleString()} lb`;
}

/** mm:ss under an hour, h:mm:ss beyond that. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
