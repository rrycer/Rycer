import { startOfMonth, startOfWeek, subWeeks } from "date-fns";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

async function getStats(userId: string) {
  const completedWorkouts = await db.workout.findMany({
    where: { userId, completedAt: { not: null } },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const workoutsThisWeek = completedWorkouts.filter((w) => w.date >= weekStart).length;
  const workoutsThisMonth = completedWorkouts.filter((w) => w.date >= monthStart).length;

  // Consecutive weeks (ending this week) with at least one workout.
  let currentStreak = 0;
  for (let i = 0; ; i++) {
    const cursorWeekStart = subWeeks(weekStart, i);
    const cursorWeekEnd = subWeeks(weekStart, i - 1);
    const hasWorkout = completedWorkouts.some(
      (w) => w.date >= cursorWeekStart && w.date < cursorWeekEnd
    );
    if (!hasWorkout) break;
    currentStreak++;
  }

  return {
    totalWorkouts: completedWorkouts.length,
    workoutsThisWeek,
    workoutsThisMonth,
    currentStreak,
  };
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const stats = await getStats(user.id);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="This week" value={stats.workoutsThisWeek} />
        <StatTile label="This month" value={stats.workoutsThisMonth} />
        <StatTile label="Week streak" value={stats.currentStreak} />
        <StatTile label="All-time workouts" value={stats.totalWorkouts} />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
