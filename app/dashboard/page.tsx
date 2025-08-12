import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect("/signin");
  return <div className="min-h-screen bg-black text-white" />;
}
