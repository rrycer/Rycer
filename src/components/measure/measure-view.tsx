"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiFetch } from "@/lib/fetcher";

type Entry = {
  id: string;
  weight: number;
  unit: "LB" | "KG";
  date: Date;
  notes: string | null;
};

function normalize(raw: Omit<Entry, "date"> & { date: string | Date }): Entry {
  return { ...raw, date: new Date(raw.date) };
}

export function MeasureView({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const chartData = [...entries]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((e) => ({ date: format(e.date, "MMM d"), weight: e.weight }));

  async function refresh() {
    const fresh = await apiFetch<(Omit<Entry, "date"> & { date: string })[]>("/api/body-weight");
    setEntries(fresh.map(normalize));
  }

  async function logWeight() {
    const parsed = Number(weight);
    if (!parsed || parsed <= 0) return;
    setSaving(true);
    try {
      await apiFetch("/api/body-weight", { method: "POST", body: { weight: parsed } });
      setOpen(false);
      setWeight("");
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't log weight");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    await apiFetch(`/api/body-weight/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Measure</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Log weight
        </Button>
      </div>

      {chartData.length >= 2 && (
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Bodyweight over time
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-border">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">
                {entry.weight} {entry.unit.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(entry.date, "MMM d, yyyy")}
              </p>
            </div>
            <button
              onClick={() => deleteEntry(entry.id)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Delete
            </button>
          </li>
        ))}
        {entries.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">
            No entries yet — log your weight to start tracking the trend.
          </p>
        )}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Log weight</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bw-weight">Weight (lb)</Label>
              <Input
                id="bw-weight"
                autoFocus
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <Button onClick={logWeight} disabled={saving || !weight}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
