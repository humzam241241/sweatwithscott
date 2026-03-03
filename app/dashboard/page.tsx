import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect("/signin");
  const isAdmin = Boolean((session.user as any)?.isAdmin);
  redirect(isAdmin ? "/dashboard/admin" : "/dashboard/member");
}
