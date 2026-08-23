"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/fetcher";
import type { WorkoutWithDetails } from "@/lib/types";

export function QuickStartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      await apiFetch<WorkoutWithDetails>("/api/workouts", { method: "POST", body: {} });
      router.push("/workouts/active");
    } catch (err) {
      setLoading(false);
      alert(err instanceof Error ? err.message : "Couldn't start workout");
    }
  }

  return (
    <Button size="lg" onClick={start} disabled={loading} className="w-full">
      {loading ? "Starting…" : "Quick Start (empty workout)"}
    </Button>
  );
}
