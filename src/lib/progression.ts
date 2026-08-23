type LoggedSet = { weight: number | null; reps: number | null };

export type SetSuggestion = {
  weight: number | null;
  reps: number | null;
  note: string;
};

/**
 * A simple progressive-overload nudge, not a serious training algorithm:
 * if every working set last time hit 8+ reps, suggest a small weight bump;
 * otherwise suggest matching the weight and adding one rep. Good enough to
 * take the blank-page feeling out of logging a set — not a coach.
 */
export function suggestNextSet(lastSets: LoggedSet[]): SetSuggestion | null {
  const valid = lastSets.filter(
    (s): s is { weight: number; reps: number } => s.weight != null && s.reps != null
  );
  if (valid.length === 0) return null;

  const top = valid[valid.length - 1];
  const allHitEightPlus = valid.every((s) => s.reps >= 8);

  if (allHitEightPlus) {
    const bump = top.weight >= 60 ? 5 : 2.5;
    const nextWeight = Math.round((top.weight + bump) / 2.5) * 2.5;
    return {
      weight: nextWeight,
      reps: valid[0].reps,
      note: `Last time you hit ${top.reps}+ reps across the board — try ${bump} lb heavier.`,
    };
  }

  return {
    weight: top.weight,
    reps: top.reps + 1,
    note: `Last time: ${top.weight} × ${top.reps}. Try for one more rep.`,
  };
}
