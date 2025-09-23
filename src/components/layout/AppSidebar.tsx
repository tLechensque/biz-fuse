import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Package,
  Users,
  Layers,
  ClipboardList,
  Settings,
  Building2,
  CreditCard,
  PieChart,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Propostas", url: "/proposals", icon: FileText },
  { title: "Produtos", url: "/products", icon: Package },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Kits", url: "/kits", icon: Layers },
  { title: "Briefing", url: "/briefing", icon: ClipboardList },
];

const managementItems = [
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Portfólio", url: "/portfolio", icon: PieChart },
  { title: "Pagamentos", url: "/payment-methods", icon: CreditCard },
  { title: "Organização", url: "/organization", icon: Building2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">BizFuse</h1>
                <p className="text-xs text-sidebar-foreground/60">Sales Platform</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs font-semibold">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={`${getNavCls(item.url)} flex items-center gap-3 px-3 py-2 rounded-lg transition-all`}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs font-semibold">
            Gerenciamento
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`${getNavCls(item.url)} flex items-center gap-3 px-3 py-2 rounded-lg transition-all`}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}