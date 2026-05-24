import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/app/(post-auth)/dashboard/dashboard-header";
import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/actions";

export default async function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }
  if (user?.role === "CUSTOMER") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
