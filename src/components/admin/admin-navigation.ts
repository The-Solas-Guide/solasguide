import {
  FileTextIcon,
  HeartHandshakeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react";

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
