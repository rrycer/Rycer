export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold">Rycer</h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Backend is up. UI comes next — see /api/workouts and /api/exercises.
      </p>
    </main>
  );
}
