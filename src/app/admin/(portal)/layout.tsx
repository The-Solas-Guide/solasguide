import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireAdmin } from "@/lib/admin/authorization";

export default async function AdminPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div data-admin className="min-h-svh bg-background text-foreground">
      <TooltipProvider>
        <SidebarProvider>
          <AdminSidebar email={user.email ?? "Administrator"} />
          <SidebarInset>
            <AdminHeader />
            <main className="flex flex-1 flex-col px-5 py-6 md:px-8 md:py-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
