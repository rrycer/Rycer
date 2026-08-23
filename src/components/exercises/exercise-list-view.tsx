"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/fetcher";

type Exercise = { id: string; name: string; category: string | null };

export function ExerciseListView({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  async function createExercise() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const exercise = await apiFetch<Exercise>("/api/exercises", {
        method: "POST",
        body: { name: name.trim(), category: category.trim() || undefined },
      });
      setOpen(false);
      setName("");
      setCategory("");
      router.push(`/exercises/${exercise.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't create exercise");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Exercises</h1>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          + New
        </Button>
      </div>

      <Input
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ul className="flex flex-col divide-y divide-border">
        {filtered.map((exercise) => (
          <li key={exercise.id}>
            <Link
              href={`/exercises/${exercise.id}`}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="font-medium">{exercise.name}</p>
                {exercise.category && (
                  <p className="text-xs text-muted-foreground">{exercise.category}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No exercises found.</p>
        )}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New exercise</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-name">Name</Label>
              <Input
                id="ex-name"
                autoFocus
                placeholder="e.g. Cable Row"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-category">Category</Label>
              <Input
                id="ex-category"
                placeholder="e.g. Back"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <Button onClick={createExercise} disabled={saving || !name.trim()}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
