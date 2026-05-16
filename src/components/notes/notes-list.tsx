"use client";

import * as React from "react";
import { Search, Plus, FileText, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

export interface ITagData {
  _id: string;
  name: string;
}

export interface ICategoryData {
  _id: string;
  name: string;
}

export interface NoteItemData {
  _id: string;
  title: string;
  content?: string;
  updatedAt: string | Date;
  tags: ITagData[];
  category?: ICategoryData | null;
  archived: boolean;
}

interface NotesListProps {
  notes: NoteItemData[];
  activeNoteId?: string;
  isLoading: boolean;
  onSelectNote: (note: NoteItemData) => void;
  onCreateNote: () => void;
  viewTitle?: string;
}

function formatTime(dateString: string | Date) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return "";
  }
}

export function NotesList({
  notes,
  activeNoteId,
  isLoading,
  onSelectNote,
  onCreateNote,
  viewTitle = "All Notes",
}: NotesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [searchResults, setSearchResults] = React.useState<NoteItemData[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const [tags, setTags] = React.useState<ITagData[]>([]);
  const [categories, setCategories] = React.useState<ICategoryData[]>([]);

  const currentTag = searchParams.get("tag") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "updatedAt_desc";

  React.useEffect(() => {
    async function loadMetadata() {
      try {
        const [tagsRes, catRes] = await Promise.all([
          fetch("/api/tags"),
          fetch("/api/categories")
        ]);
        const tagsData = await tagsRes.json();
        const catData = await catRes.json();
        if (tagsData.success) setTags(tagsData.tags);
        if (catData.success) setCategories(catData.categories);
      } catch (error) {
        console.error("Failed to fetch filter metadata");
      }
    }
    loadMetadata();
  }, []);

  React.useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const isArchived = viewTitle === "Archived Notes";
        const params = new URLSearchParams();
        params.append("q", debouncedSearchQuery);
        params.append("archived", String(isArchived));
        if (currentTag) params.append("tag", currentTag);
        if (currentCategory) params.append("category", currentCategory);
        if (currentSort) params.append("sort", currentSort);

        const res = await fetch(`/api/notes/search?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.notes);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchQuery, viewTitle, currentTag, currentCategory, currentSort]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "none" && value !== "updatedAt_desc") {
      params.set(key, value);
    } else if (value === "none" && key === "category") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    const params = new URLSearchParams();
    if (viewTitle === "Archived Notes") params.set("view", "archived");
    router.push(`${pathname}?${params.toString()}`);
  };

  const isSearchActive = debouncedSearchQuery.trim().length > 0;
  const displayNotes = isSearchActive ? searchResults : notes;
  const showLoading = isLoading || isSearching;
  const hasFilters = isSearchActive || currentTag || currentCategory;

  return (
    <div className="flex h-full w-full flex-col border-r border-border/40 bg-background select-none animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 p-5 pb-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <h2 className="font-subheading font-semibold text-base tracking-tight text-foreground capitalize">
            {viewTitle}
          </h2>
          <button
            onClick={onCreateNote}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary transition-colors active:scale-95"
            title="New Note"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="relative group mt-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary/70">
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 w-full rounded-lg border bg-muted/20 pl-9 pr-3 font-sans text-[13px] placeholder:text-muted-foreground/60 transition-all focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/5 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-0.5 overflow-x-auto custom-scrollbar pb-1">
          <select
            className="h-7 min-w-[115px] rounded-md border border-border/50 bg-transparent px-2 text-[10px] font-medium text-muted-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
            value={currentSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            <option value="updatedAt_desc">Recently Updated</option>
            <option value="updatedAt_asc">Oldest Updated</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
          </select>

          <select
            className="h-7 min-w-[100px] max-w-[140px] rounded-md border border-border/50 bg-transparent px-2 text-[10px] font-medium text-muted-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
            value={currentCategory}
            onChange={(e) => updateFilter("category", e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="none">Uncategorized</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select
            className="h-7 min-w-[90px] max-w-[140px] rounded-md border border-border/50 bg-transparent px-2 text-[10px] font-medium text-muted-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
            value={currentTag}
            onChange={(e) => updateFilter("tag", e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map(t => <option key={t._id} value={t._id}>#{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {showLoading ? (
          <div className="flex flex-col gap-1 px-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2 p-4 rounded-xl bg-muted/5 animate-pulse">
                <div className="h-4 w-3/4 rounded bg-muted/40" />
                <div className="h-3 w-full rounded bg-muted/20" />
                <div className="h-2.5 w-1/3 rounded bg-muted/20 mt-1" />
              </div>
            ))}
          </div>
        ) : displayNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-muted-foreground/60">
            <FileText className="h-6 w-6 mb-3 opacity-30" />
            <p className="font-sans text-[13px] font-medium text-foreground/70 mb-1">
              {hasFilters ? "No matching notes" : "No notes yet"}
            </p>
            <p className="font-sans text-[12px] text-muted-foreground/70 mb-4">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Create a note to start capturing your ideas."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-[11.5px] font-medium text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors active:scale-95"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 px-2">
            {displayNotes.map((note) => {
              const isActive = activeNoteId === note._id;

              return (
                <button
                  key={note._id}
                  onClick={() => onSelectNote(note)}
                  className={cn(
                    "group flex flex-col gap-1.5 rounded-xl p-3 text-left transition-all duration-150 ease-out font-sans select-none outline-none",
                    isActive
                      ? "bg-zinc-100/80 dark:bg-zinc-800/60 border border-transparent shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 border border-transparent"
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <span
                      className={cn(
                        "font-medium text-[13.5px] tracking-tight line-clamp-1 leading-tight flex-1 transition-colors",
                        isActive ? "text-foreground" : "text-zinc-700 dark:text-zinc-300 group-hover:text-foreground"
                      )}
                    >
                      {note.title || "Untitled Note"}
                    </span>
                    <span className="shrink-0 text-[10.5px] text-muted-foreground/75 font-medium tabular-nums pt-0.5">
                      {formatTime(note.updatedAt)}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "line-clamp-2 text-[11.5px] leading-normal transition-colors",
                      isActive ? "text-muted-foreground" : "text-muted-foreground/75"
                    )}
                  >
                    {note.content
                      ? note.content.replace(/[#*`]/g, "").trim()
                      : "No additional text."}
                  </p>
                  {(note.category || (note.tags && note.tags.length > 0)) && (
                    <div className="flex items-center flex-wrap gap-1 mt-1.5 pt-0.5">
                      {note.category && (
                        <span className="inline-flex items-center text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize border border-black/5 dark:border-white/5 tracking-tight">
                          {note.category.name}
                        </span>
                      )}
                      {note.tags && note.tags.map((t) => (
                        <span key={t._id} className="text-[9.5px] text-primary/80 dark:text-primary/70 font-medium">
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
