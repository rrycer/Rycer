"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiFetch } from "@/lib/fetcher";

type Exercise = { id: string; name: string; category: string | null };

export function AddExerciseSheet({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exerciseId: string) => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    apiFetch<Exercise[]>("/api/exercises").then(setExercises).catch(() => {});
  }, [open]);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-3">
        <SheetHeader>
          <SheetTitle>Add exercise</SheetTitle>
        </SheetHeader>
        <Input
          autoFocus
          placeholder="Search exercises…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="flex flex-col overflow-y-auto">
          {filtered.map((exercise) => (
            <li key={exercise.id}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onSelect(exercise.id);
                  setQuery("");
                }}
              >
                <div className="text-left">
                  <p>{exercise.name}</p>
                  {exercise.category && (
                    <p className="text-xs text-muted-foreground">{exercise.category}</p>
                  )}
                </div>
              </Button>
            </li>
          ))}
          {filtered.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">No exercises found.</p>
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
