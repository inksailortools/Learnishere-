import { redirect } from "next/navigation";
import { dashboardLocation, getCurrentUser, loginLocation } from "@/lib/auth";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect(loginLocation("/dashboard"));
  redirect(dashboardLocation(user.role === "super_admin" ? "admin" : "student"));
}
