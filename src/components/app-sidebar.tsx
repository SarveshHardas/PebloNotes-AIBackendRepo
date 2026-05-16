"use client";

import * as React from "react";
import { BookOpen, Home, LogOut, Sparkles, Archive, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
} from "@/components/ui/sidebar";
import Image from "next/image";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

function SidebarNavigationMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const view = searchParams.get("view") || "active";
  const isArchiveActive = view === "archived" && pathname === "/dashboard";
  const isAllNotesActive = (view === "active" || !searchParams.has("view")) && pathname === "/dashboard";
  const isAnalyticsActive = pathname === "/dashboard/analytics";

  return (
    <SidebarMenu className="gap-1">
      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="All Notes" 
          isActive={isAllNotesActive}
          onClick={() => router.push("/dashboard")}
          className={cn(
            "font-sans text-[13px] py-5 transition-all",
            isAllNotesActive 
              ? "font-semibold bg-primary/5 text-primary hover:bg-primary/10" 
              : "font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className={cn("size-4", isAllNotesActive ? "text-primary" : "text-muted-foreground")} />
          <span>All Notes</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Archived Notes" 
          isActive={isArchiveActive}
          onClick={() => router.push("/dashboard?view=archived")}
          className={cn(
            "font-sans text-[13px] py-5 transition-all",
            isArchiveActive 
              ? "font-semibold bg-primary/5 text-primary hover:bg-primary/10" 
              : "font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground"
          )}
        >
          <Archive className={cn("size-4", isArchiveActive ? "text-primary" : "text-muted-foreground")} />
          <span>Archived Notes</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton 
          tooltip="Analytics" 
          isActive={isAnalyticsActive}
          onClick={() => router.push("/dashboard/analytics")}
          className={cn(
            "font-sans text-[13px] py-5 transition-all",
            isAnalyticsActive 
              ? "font-semibold bg-primary/5 text-primary hover:bg-primary/10" 
              : "font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className={cn("size-4", isAnalyticsActive ? "text-primary" : "text-muted-foreground")} />
          <span>Analytics</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavigationMenuSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-2 animate-pulse">
      <div className="h-8 w-full rounded-md bg-muted/20" />
      <div className="h-8 w-full rounded-md bg-muted/20" />
      <div className="h-8 w-full rounded-md bg-muted/20" />
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      toast.success("Successfully logged out.");
      router.refresh();
      router.push("/login");
    } catch (e) {
      toast.error("Logout failed.");
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b border-border/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5 select-none">
              <div className="grid flex-1 ml-1 text-left leading-tight font-sans group-data-[collapsible=icon]:hidden">
                <span className="truncate text-2xl font-heading font-semibold tracking-tight text-foreground">
                  Peblo Notes
                </span>
                <span className="truncate text-sm text-secondary-foreground/80 font-medium">
                  Workspace
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <React.Suspense fallback={<NavigationMenuSkeleton />}>
              <SidebarNavigationMenu />
            </React.Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Log out"
              className="font-sans text-[13px] py-5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
