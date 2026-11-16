import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard";
import { dashboardLocation, getCurrentUser, loginLocation } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect(loginLocation("/dashboard/admin"));
  if (user.role !== "super_admin") redirect(dashboardLocation("student"));
  return <Dashboard role="admin" />;
}
