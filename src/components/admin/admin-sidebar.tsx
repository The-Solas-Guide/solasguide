"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  HeartHandshakeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react";
import { signOutAdmin } from "@/lib/admin/auth-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export const adminNavigation = [
  { title: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { title: "Practitioners", href: "/admin/practitioners", icon: UsersIcon },
  { title: "Pages & Content", href: "/admin/content", icon: FileTextIcon },
  { title: "Taxonomy", href: "/admin/taxonomy", icon: TagsIcon },
  {
    title: "Customer Enquiries",
    href: "/admin/customer-enquiries",
    icon: InboxIcon,
  },
  {
    title: "Practitioner Interest",
    href: "/admin/practitioner-interest",
    icon: HeartHandshakeIcon,
  },
] as const;

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Solas Admin">
              <Link href="/admin">
                <Image
                  src="/brand/solas-mark-pebble.png"
                  alt=""
                  width={64}
                  height={64}
                  className="size-8 object-contain"
                />
                <span className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">The Solas Guide</span>
                  <span className="text-xs text-muted-foreground">Admin CMS</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={email}>
              <Avatar className="size-8">
                <AvatarFallback>{getInitials(email)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-left text-sm">
                {email}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOutAdmin}>
              <SidebarMenuButton asChild tooltip="Sign out">
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
