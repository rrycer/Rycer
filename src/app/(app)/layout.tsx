import { BottomNav } from "@/components/bottom-nav";

// Every page here reads per-user data (workouts, exercises, stats) straight
// from Postgres — it must never be statically prerendered at build time,
// which would freeze that data for every visitor until the next deploy.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-20">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
