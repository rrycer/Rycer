"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const REST_SECONDS = 90;

/** Mount with a fresh `key` (e.g. an incrementing counter) to restart the countdown. */
export function RestTimer({ onDismiss }: { onDismiss: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(REST_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  if (secondsLeft <= 0) return null;

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-x-0 bottom-20 z-30 mx-auto flex w-full max-w-lg items-center justify-between gap-3 bg-foreground px-4 py-2 text-background">
      <span className="text-sm font-medium">Rest: {mm}:{ss}</span>
      <button onClick={onDismiss} className="rounded-full p-1 hover:bg-background/20" aria-label="Dismiss rest timer">
        <X className="size-4" />
      </button>
    </div>
  );
}
