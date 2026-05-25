"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Switch } from "../ui/switch";

import { MoonIcon } from "@/lib/icons"

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-2 cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <div className="flex items-center gap-2">
        <MoonIcon className="size-4" />
        <span className="text-sm">Mode sombre</span>
      </div>
      <Switch checked={theme === "dark"} />
    </div>
  );
}
