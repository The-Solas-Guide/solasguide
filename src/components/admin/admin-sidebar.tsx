"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { adminNavigation } from "@/components/admin/admin-navigation";
import { signOutAdmin } from "@/lib/admin/auth-actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export { adminNavigation } from "@/components/admin/admin-navigation";

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-5">
        <Link
          href="/admin"
          className="flex min-h-11 items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Image
            src="/brand/solas-mark-pebble.png"
            alt=""
            width={64}
            height={64}
            className="size-7 object-contain"
          />
          <span className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">The Solas Guide</span>
            <span className="mt-1 text-xs text-muted-foreground">Administrator</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {adminNavigation.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="min-h-11"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <p
              className="truncate px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden"
              title={email}
            >
              {email}
            </p>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOutAdmin}>
              <SidebarMenuButton asChild tooltip="Sign out" className="min-h-11">
                <button type="submit" className="w-full">
                  <LogOutIcon />
                  <span>Sign out</span>
                </button>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
