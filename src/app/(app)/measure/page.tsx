import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { MeasureView } from "@/components/measure/measure-view";

export default async function MeasurePage() {
  const user = await getCurrentUser();
  const entries = await db.bodyWeightEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return <MeasureView initialEntries={entries} />;
}
