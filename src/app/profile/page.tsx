import { getCurrentUser } from "@/lib/current-user";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
    </div>
  );
}
