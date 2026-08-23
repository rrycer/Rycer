import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { routineInclude } from "@/lib/routine-include";
import { RoutineEditView } from "@/components/routines/routine-edit-view";

type Params = { params: Promise<{ id: string }> };

export default async function EditRoutinePage({ params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();

  const routine = await db.routine.findUnique({
    where: { id, userId: user.id },
    include: routineInclude,
  });

  if (!routine) notFound();

  return <RoutineEditView routine={routine} />;
}
