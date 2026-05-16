"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SidebarMenuButton className="font-sans text-[13px] py-5 text-muted-foreground transition-colors pointer-events-none">
        <div className="size-4 bg-muted/40 rounded-full animate-pulse" />
        <span>Theme</span>
      </SidebarMenuButton>
    );
  }

  const isDark = theme === "dark";

  return (
    <SidebarMenuButton
      onClick={() => setTheme(isDark ? "light" : "dark")}
      tooltip="Toggle theme"
      className="font-sans text-[13px] py-5 text-muted-foreground hover:text-foreground transition-colors"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </SidebarMenuButton>
  );
}
