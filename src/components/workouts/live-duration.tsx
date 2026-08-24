"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/workout-stats";

export function LiveDuration({ since }: { since: Date }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return <>{formatDuration(now - since.getTime())}</>;
}
