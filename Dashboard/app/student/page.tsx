import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard";
import { dashboardLocation, getCurrentUser, loginLocation } from "@/lib/auth";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect(loginLocation("/dashboard/student"));
  if (user.role !== "student") redirect(dashboardLocation("admin"));
  return <Dashboard role="student" />;
}
