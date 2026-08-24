"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/fetcher";

export default function NewRoutinePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const routine = await apiFetch<{ id: string }>("/api/routines", {
        method: "POST",
        body: { name: name.trim() },
      });
      router.push(`/routines/${routine.id}/edit`);
    } catch (err) {
      setSaving(false);
      alert(err instanceof Error ? err.message : "Couldn't create template");
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">New Template</h1>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="routine-name">Name</Label>
        <Input
          id="routine-name"
          autoFocus
          placeholder="e.g. Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button onClick={create} disabled={saving || !name.trim()}>
        {saving ? "Creating…" : "Create & add exercises"}
      </Button>
    </div>
  );
}
