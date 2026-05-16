"use client";

import * as React from "react";
import { Menu, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { NotesList, NoteItemData } from "@/components/notes/notes-list";
import { NoteEditor } from "@/components/notes/note-editor";
import { EmptyWorkspace } from "@/components/notes/empty-workspace";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const [notes, setNotes] = React.useState<NoteItemData[]>([]);
  const [selectedNote, setSelectedNote] = React.useState<NoteItemData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toggleSidebar, isMobile } = useSidebar();
  
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view") || "active";
  const isArchivedView = viewMode === "archived";

  const fetchNotes = React.useCallback(async (shouldSelectFirst = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (isArchivedView) params.append("archived", "true");
      
      const tag = searchParams.get("tag");
      const category = searchParams.get("category");
      const sort = searchParams.get("sort");
      
      if (tag) params.append("tag", tag);
      if (category) params.append("category", category);
      if (sort) params.append("sort", sort);

      const endpoint = `/api/notes?${params.toString()}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setNotes(data.notes);
        if (shouldSelectFirst && data.notes.length > 0) {
          setSelectedNote(data.notes[0]);
        } else {
          setSelectedNote(null);
        }
      } else {
        toast.error("Could not fetch your workspace.");
      }
    } catch (error) {
      toast.error("Workspace synchronization offline.");
    } finally {
      setIsLoading(false);
    }
  }, [isArchivedView, searchParams]);

  React.useEffect(() => {
    fetchNotes(true);
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNotes((prev) => [data.note, ...prev]);
        setSelectedNote(data.note);
        toast.success("New canvas ready.", { duration: 2000 });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to instantiate new note.");
    }
  };

  const handleNoteUpdated = (updated: NoteItemData) => {
    setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    setSelectedNote(updated);
  };

  const handleNoteDeleted = (id: string) => {
    setNotes((prev) => prev.filter((n) => n._id !== id));
    setSelectedNote(null);
  };

  const showListOnMobile = !selectedNote;
  const showEditorOnMobile = !!selectedNote;

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-background animate-in fade-in duration-200">
      
      <div
        className={cn(
          "w-full md:w-[280px] lg:w-[320px] xl:w-[340px] flex-shrink-0 flex flex-col h-full border-r border-border/20 bg-background transition-all duration-200",
          isMobile && !showListOnMobile && "hidden",
          !isMobile && "flex"
        )}
      >
        <div className="md:hidden absolute top-5 left-4 z-50">
          <button
            onClick={() => toggleSidebar()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border shadow-sm active:scale-95 transition-all"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <NotesList
          notes={notes}
          activeNoteId={selectedNote?._id}
          isLoading={isLoading}
          onSelectNote={setSelectedNote}
          onCreateNote={handleCreateNote}
          viewTitle={isArchivedView ? "Archived Notes" : "All Notes"}
        />
      </div>

      <main
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden bg-background transition-all duration-200 relative",
          isMobile && !showEditorOnMobile && "hidden",
          !isMobile && "flex"
        )}
      >
        <div className="hidden md:flex absolute top-3.5 left-4 z-50 group">
          <button
            onClick={() => toggleSidebar()}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-background border border-border/40 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-95 transition-all duration-200 cursor-pointer"
            title="Toggle Sidebar navigation"
          >
            <Menu className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {selectedNote ? (
          <NoteEditor
            key={selectedNote._id}
            note={selectedNote}
            onBackToList={() => setSelectedNote(null)}
            onNoteUpdated={handleNoteUpdated}
            onNoteDeleted={handleNoteDeleted}
          />
        ) : (
          <EmptyWorkspace 
            onCreateNote={handleCreateNote} 
            title={isArchivedView ? "Archive Empty" : undefined}
            description={isArchivedView ? "Notes that you archive from your workspace will be preserved securely here." : undefined}
          />
        )}
      </main>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="flex flex-1 h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground animate-in fade-in duration-300">
        <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
        <p className="font-sans text-xs font-medium select-none">Preparing workspace...</p>
      </div>
    </div>
  );
}

export default function NotesDashboard() {
  return (
    <React.Suspense fallback={<DashboardLoader />}>
      <DashboardContent />
    </React.Suspense>
  );
}
