"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";

interface PublicNoteData {
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  updatedAt: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [note, setNote] = React.useState<PublicNoteData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/shared/${shareId}`);
        const data = await res.json();
        if (data.success && data.note) {
          setNote(data.note);
        } else {
          setError(data.error || "This note is no longer available.");
        }
      } catch (e) {
        setError("Unable to connect to Peblo Notes.");
      } finally {
        setIsLoading(false);
      }
    };
    if (shareId) {
      fetchNote();
    }
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0d] flex justify-center px-6 py-20 animate-in fade-in duration-300">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div className="h-10 w-3/4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
          <div className="flex gap-2 mb-8">
             <div className="h-5 w-24 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
             <div className="h-5 w-16 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-4 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0d] flex items-center justify-center px-6 py-20 animate-in fade-in duration-300">
        <div className="max-w-md flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2">
             <AlertCircle className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <h1 className="text-lg font-heading font-semibold text-foreground tracking-tight">
            Note unavailable
          </h1>
          <p className="text-sm font-sans text-muted-foreground">
            {error || "This link might be invalid, or the owner has disabled public access."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0d] select-text">
      <div className="mx-auto max-w-2xl px-6 py-20 md:py-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <header className="mb-12 flex flex-col gap-5">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
            {note.title || "Untitled Note"}
          </h1>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-[13px] font-sans text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              <span>
                Last updated {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </div>

            {(note.category || note.tags.length > 0) && (
              <div className="flex items-center gap-3 border-l border-border/40 pl-4">
                {note.category && (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 capitalize font-medium">
                    {note.category}
                  </span>
                )}
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-primary/70 font-medium tracking-tight">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="max-w-none font-sans text-[15.5px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
          {note.content ? (
            note.content.split("\n").map((paragraph, idx) => (
              <p key={idx} className="mb-5 min-h-[1.5em]">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="italic text-muted-foreground/60">This note has no additional text.</p>
          )}
        </div>
        
        <div className="mt-24 pt-8 border-t border-border/20 flex items-center justify-between text-[11px] font-sans text-muted-foreground/50">
          <span>Published via Peblo Notes</span>
        </div>
      </div>
    </div>
  );
}
