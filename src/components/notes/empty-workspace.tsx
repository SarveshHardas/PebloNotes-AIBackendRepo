"use client";

import * as React from "react";
import { Sparkles, Plus, FileText } from "lucide-react";

interface EmptyWorkspaceProps {
  onCreateNote?: () => void;
  title?: string;
  description?: string;
}

export function EmptyWorkspace({
  onCreateNote,
  title = "No note selected",
  description = "Capture context, structure thoughts, and uncover connections. Create a fresh canvas to begin."
}: EmptyWorkspaceProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-zinc-50/40 dark:bg-background select-none h-full animate-in fade-in duration-500">
      <div className="max-w-[320px] flex flex-col items-center gap-6">
        <FileText className="h-8 w-8 text-muted-foreground/80" />
        <div className="space-y-2 font-sans">
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <button
          onClick={onCreateNote}
          className="inline-flex items-center gap-2 px-4 py-2 bg-background border hover:border-border-hover hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-sm font-medium text-foreground rounded-lg transition-all active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Create new note</span>
        </button>
      </div>
    </div>
  );
}
