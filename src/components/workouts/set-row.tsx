"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SetRowData = {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
};

export function SetRow({
  set,
  previousLabel,
  onUpdate,
  onDelete,
}: {
  set: SetRowData;
  previousLabel: string | null;
  onUpdate: (patch: { weight?: number | null; reps?: number | null; completed?: boolean }) => void;
  onDelete: () => void;
}) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");

  function commitWeight() {
    const parsed = weight === "" ? null : Number(weight);
    if (parsed !== set.weight) onUpdate({ weight: parsed });
  }

  function commitReps() {
    const parsed = reps === "" ? null : Number(reps);
    if (parsed !== set.reps) onUpdate({ reps: parsed });
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[1.5rem_1fr_4.5rem_4.5rem_2.5rem_2rem] items-center gap-2 rounded-md px-1 py-1",
        set.completed && "bg-accent"
      )}
    >
      <span className="text-center text-sm font-medium text-muted-foreground">
        {set.setNumber}
      </span>
      <span className="truncate text-xs text-muted-foreground">{previousLabel ?? "—"}</span>
      <Input
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={commitWeight}
        placeholder="lb"
        className="h-9 px-2 text-center"
      />
      <Input
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={commitReps}
        placeholder="reps"
        className="h-9 px-2 text-center"
      />
      <button
        onClick={() => onUpdate({ completed: !set.completed })}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border",
          set.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input text-muted-foreground"
        )}
        aria-label={set.completed ? "Mark set incomplete" : "Mark set complete"}
      >
        <Check className="size-4" />
      </button>
      <button
        onClick={onDelete}
        className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-destructive"
        aria-label="Delete set"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
