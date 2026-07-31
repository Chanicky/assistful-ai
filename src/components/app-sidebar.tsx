import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, Microscope, Bookmark, LayoutTemplate, Settings, Sparkles } from "lucide-react";

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
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Research Assistant", url: "/research", icon: Microscope },
  { title: "Saved Work", url: "/saved", icon: Bookmark },
  { title: "Templates", url: "/templates", icon: LayoutTemplate },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <span className="gradient-hero flex size-8 shrink-0 items-center justify-center rounded-lg text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display truncate text-sm font-semibold leading-tight group-data-[collapsible=icon]:hidden">
            AI Workplace
            <span className="block text-xs font-normal text-muted-foreground">Productivity Assistant</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4 text-[11px] leading-relaxed text-muted-foreground group-data-[collapsible=icon]:hidden">
        AI-generated content should be reviewed for accuracy before professional use.
      </SidebarFooter>
    </Sidebar>
  );
}