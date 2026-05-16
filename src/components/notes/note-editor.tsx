"use client";

import * as React from "react";
import { 
  Archive, 
  MoreVertical, 
  ArrowLeft, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Save,
  Trash2,
  Tag as TagIcon,
  Layers,
  ChevronDown,
  X,
  RotateCcw,
  Sparkles,
  Copy,
  ListTodo,
  Share
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NoteItemData, ICategoryData } from "./notes-list";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface NoteEditorProps {
  note: NoteItemData;
  onBackToList?: () => void;  
  onNoteUpdated: (note: NoteItemData) => void;
  onNoteDeleted: (id: string) => void;
}

import { ShareModal } from "./share-modal";

export function NoteEditor({
  note,
  onBackToList,
  onNoteUpdated,
  onNoteDeleted,
}: NoteEditorProps) {
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content || "");
  const [saveState, setSaveState] = React.useState<"saved" | "dirty" | "saving">("saved");
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  
  const [isAddingTag, setIsAddingTag] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState("");
  const [isTagLoading, setIsTagLoading] = React.useState(false);

  const [categories, setCategories] = React.useState<ICategoryData[]>([]);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState("");
  const [isCatLoading, setIsCatLoading] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [summaryData, setSummaryData] = React.useState<{ summary: string; updatedAt: string } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);

  React.useEffect(() => {
    const loadSummary = async () => {
      setIsSummaryLoading(true);
      try {
        const res = await fetch(`/api/notes/${note._id}/summary`);
        const data = await res.json();
        if (data.success && data.summary) {
          setSummaryData(data.summary);
        } else {
          setSummaryData(null);
        }
      } catch {
        setSummaryData(null);
      } finally {
        setIsSummaryLoading(false);
      }
    };
    loadSummary();
  }, [note._id]);

  const [extractedTasks, setExtractedTasks] = React.useState<string[] | null>(null);
  const [isTasksLoading, setIsTasksLoading] = React.useState(true);
  const [isExtractingTasks, setIsExtractingTasks] = React.useState(false);

  const [suggestedTitle, setSuggestedTitle] = React.useState<string | null>(null);
  const [isSuggestingTitle, setIsSuggestingTitle] = React.useState(false);

  React.useEffect(() => {
    const loadTasks = async () => {
      setIsTasksLoading(true);
      try {
        const res = await fetch(`/api/notes/${note._id}/tasks`);
        const data = await res.json();
        if (data.success && data.tasks) {
          setExtractedTasks(data.tasks);
        } else {
          setExtractedTasks(null);
        }
      } catch {
        setExtractedTasks(null);
      } finally {
        setIsTasksLoading(false);
      }
    };
    loadTasks();
  }, [note._id]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error("Failed to prefetch categories list.");
      }
    };
    fetchCategories();
  }, []);

  React.useEffect(() => {
    setTitle(note.title);
    setContent(note.content || "");
    setSaveState("saved");
  }, [note._id]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, note]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    setSaveState("dirty");
    onNoteUpdated({ ...note, content: nextVal, title });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setTitle(nextVal);
    setSaveState("dirty");
    onNoteUpdated({ ...note, title: nextVal, content });
  };

  const handleSave = async (isManual: boolean = false) => {
    if (saveState === "saving") return;
    
    setIsSaving(true);
    setSaveState("saving");
    
    try {
      const currentTagIds = (note.tags || []).map((t: any) => typeof t === "object" ? t._id : t);
      const currentCategoryId = note.category ? (typeof note.category === "object" ? note.category._id : note.category) : null;

      const response = await fetch(`/api/notes/${note._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled Note",
          content: content,
          tags: currentTagIds,
          category: currentCategoryId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSaveState("saved");
        onNoteUpdated(data.note); 
        
        if (isManual) {
          toast.success("Workspace changes committed.", { duration: 1500 });
        }
      } else {
        throw new Error(data.error || "Save operation failed.");
      }
    } catch (error: any) {
      setSaveState("dirty");
      toast.error(error.message || "Synchronization offline.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveToggle = async () => {
    const nextArchivedState = !note.archived;
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: nextArchivedState }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(nextArchivedState ? "Note archived securely." : "Note restored to inbox.", { duration: 2000 });
        onNoteDeleted(note._id); 
      }
    } catch (err) {
      toast.error(nextArchivedState ? "Failed to archive note." : "Failed to restore note.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setIsDeleteOpen(false);
        toast.success("Note purged permanently.");
        onNoteDeleted(note._id);
      }
    } catch (err) {
      toast.error("Purge operation failed.");
    }
  };

  const handleTagSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagName.trim()) {
      e.preventDefault();
      setIsTagLoading(true);
      try {
        const res = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newTagName.trim() }),
        });
        const tagRes = await res.json();

        if (tagRes.success) {
          const currentTagIds = (note.tags || []).map((t: any) => typeof t === "object" ? t._id : t);
          if (currentTagIds.includes(tagRes.tag._id)) {
            toast.info("Tag already applied to this canvas.");
            setNewTagName("");
            setIsAddingTag(false);
            setIsTagLoading(false);
            return;
          }

          const updatedIds = [...currentTagIds, tagRes.tag._id];
          const patchRes = await fetch(`/api/notes/${note._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: updatedIds }),
          });

          const patchData = await patchRes.json();
          if (patchData.success) {
            onNoteUpdated(patchData.note);
            toast.success(`Tagged with #${tagRes.tag.name}`, { duration: 1500 });
            setNewTagName("");
            setIsAddingTag(false);
          }
        }
      } catch (err) {
        toast.error("Tag establishment offline.");
      } finally {
        setIsTagLoading(false);
      }
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const currentTagIds = (note.tags || []).map((t: any) => typeof t === "object" ? t._id : t);
      const updatedTagIds = currentTagIds.filter((id) => id !== tagId);

      const response = await fetch(`/api/notes/${note._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTagIds }),
      });

      const data = await response.json();
      if (data.success) {
        onNoteUpdated(data.note);
        toast.success("Tag detached.", { duration: 1500 });
      }
    } catch (err) {
      toast.error("Failed to detach tag.");
    }
  };

  const handleCategorySelect = async (categoryId: string | null) => {
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryId }),
      });

      const data = await response.json();
      if (data.success) {
        onNoteUpdated(data.note);
        toast.success(categoryId ? "Workspace item categorized." : "Category cleared.", { duration: 1500 });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Failed to re-categorize note.");
    }
  };

  const handleCategorySubmit = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newCatName.trim()) {
      e.preventDefault();
      setIsCatLoading(true);
      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCatName.trim() }),
        });
        const catRes = await response.json();

        if (catRes.success) {
          setCategories((prev) => {
            if (prev.some((c) => c._id === catRes.category._id)) return prev;
            return [...prev, catRes.category].sort((a, b) => a.name.localeCompare(b.name));
          });

          const patchRes = await fetch(`/api/notes/${note._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: catRes.category._id }),
          });

          const patchData = await patchRes.json();
          if (patchData.success) {
            onNoteUpdated(patchData.note);
            toast.success(`Applied to "${catRes.category.name}"`);
            setNewCatName("");
            setIsAddingCategory(false);
          }
        }
      } catch (err) {
        toast.error("Category upsert offline.");
      } finally {
        setIsCatLoading(false);
      }
    }
  };

  const handleGenerateSummary = async () => {
    if (!content || content.trim().length < 20) {
      toast.info("Write a bit more detail before invoking the AI summary.", { duration: 3000 });
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const res = await fetch(`/api/notes/${note._id}/summary`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSummaryData(data.summary);
        toast.success("Generated modern summary.");
      } else {
        toast.error(data.error || "Failed to generate summary.");
      }
    } catch (err) {
      toast.error("Summarization offline. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    navigator.clipboard.writeText(summaryData.summary);
    toast.success("Copied AI summary.");
  };

  const handleExtractTasks = async () => {
    if (!content || content.trim().length < 30) {
      toast.info("Add more detail before asking to parse action items.", { duration: 3000 });
      return;
    }

    setIsExtractingTasks(true);
    try {
      const res = await fetch(`/api/notes/${note._id}/tasks`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setExtractedTasks(data.tasks);
        if (data.tasks.length === 0) {
          toast.info("Processed successfully, but found no concrete actions.");
        } else {
          toast.success(`Isolated ${data.tasks.length} action items.`);
        }
      } else {
        toast.error(data.error || "Failed parsing tasks.");
      }
    } catch (err) {
      toast.error("Task extractor currently unreachable.");
    } finally {
      setIsExtractingTasks(false);
    }
  };

  const handleCopyTasks = () => {
    if (!extractedTasks || extractedTasks.length === 0) return;
    const formatted = extractedTasks.map((t) => `- [ ] ${t}`).join("\n");
    navigator.clipboard.writeText(formatted);
    toast.success("Copied checklist items.");
  };

  const handleSuggestTitle = async () => {
    if (!content || content.trim().length < 25) {
      toast.info("Type at least 25 characters of note text to derive a title.", { duration: 3000 });
      return;
    }

    setIsSuggestingTitle(true);
    try {
      const res = await fetch(`/api/notes/${note._id}/suggest-title`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSuggestedTitle(data.title);
        toast.success("Generated modern title suggestion.");
      } else {
        toast.error(data.error || "Unable to suggest title.");
      }
    } catch {
      toast.error("Title suggestions temporarily offline.");
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  const handleApplyTitle = () => {
    if (!suggestedTitle) return;
    setTitle(suggestedTitle);
    setSaveState("dirty");
    setSuggestedTitle(null);
    toast.success("Title applied successfully.");
  };

  const saveRef = React.useRef(handleSave);
  React.useEffect(() => {
    saveRef.current = handleSave;
  });

  React.useEffect(() => {
    if (saveState !== "dirty") return;

    const timer = setTimeout(() => {
      saveRef.current(false); 
    }, 1200); 
    return () => clearTimeout(timer);
  }, [title, content, saveState]);

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveState]);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="flex h-full flex-col bg-background select-text overflow-hidden animate-in fade-in duration-300 slide-in-from-right-1">
      
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/10 px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="md:hidden -ml-2 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-[11px] font-sans text-muted-foreground/70 select-none">
            <Clock className="h-3 w-3" />
            <span>
              Modified {new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
            <div className="h-2.5 w-px bg-border/50 mx-1" />
            
            <div className="flex items-center gap-1">
              {saveState === "saved" ? (
                <>
                  <CheckCircle className="h-3 w-3 text-emerald-500/70" />
                  <span>Synced</span>
                </>
              ) : saveState === "saving" ? (
                <>
                  <span className="h-3 w-3 border-t-2 border-primary rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse mr-0.5" />
                  <span className="text-amber-600 dark:text-amber-400/60 font-medium">Unsaved</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          
          <Button
            variant={saveState === "dirty" ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 px-3 font-sans text-xs font-medium transition-all active:scale-[0.98]",
              saveState === "dirty" 
                ? "bg-primary text-black hover:bg-primary/90 shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 border-border/40"
            )}
            onClick={() => handleSave(true)}
            disabled={isSaving || saveState === "saved"}
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <div className="w-px h-4 bg-border/40 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary || !content || content.trim().length < 20}
            className="h-8 px-3 font-sans text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40"
            title="Summarize this note using AI"
          >
            {isGeneratingSummary ? (
              <>
                <span className="h-3 w-3 border-t-2 border-muted-foreground rounded-full animate-spin mr-1.5" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                Summarize
              </>
            )}
          </Button>

          <div className="w-px h-4 bg-border/40 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExtractTasks}
            disabled={isExtractingTasks || !content || content.trim().length < 30}
            className="h-8 px-3 font-sans text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40"
            title="Extract concrete action items using AI"
          >
            {isExtractingTasks ? (
              <>
                <span className="h-3 w-3 border-t-2 border-muted-foreground rounded-full animate-spin mr-1.5" />
                Extracting...
              </>
            ) : (
              <>
                <ListTodo className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                Extract Tasks
              </>
            )}
          </Button>

          <div className="w-px h-4 bg-border/40 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 font-sans text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
            onClick={handleArchiveToggle}
          >
            {note.archived ? (
              <>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Restore
              </>
            ) : (
              <>
                <Archive className="mr-1.5 h-3.5 w-3.5" />
                Archive
              </>
            )}
          </Button>

          <div className="w-px h-4 bg-border/40 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 font-sans text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
            onClick={() => setIsShareModalOpen(true)}
            title="Share note to web"
          >
            <Share className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>

          <div className="w-px h-4 bg-border/40 mx-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors cursor-pointer active:scale-95 outline-none border border-transparent">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem 
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive cursor-pointer text-xs font-sans flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 xl:p-14 custom-scrollbar">
        <div className="mx-auto max-w-[700px] flex flex-col gap-6">
          
          <div className="relative group/title">
            <div className="flex items-center justify-between h-5 mb-0.5">
              <button
                onClick={handleSuggestTitle}
                disabled={isSuggestingTitle || !content || content.trim().length < 25}
                className="opacity-0 group-hover/title:opacity-100 disabled:opacity-0 transition-all inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold font-sans text-muted-foreground/60 hover:text-primary cursor-pointer select-none active:scale-95 disabled:pointer-events-none"
                title="Deduce note title automatically using AI"
              >
                {isSuggestingTitle ? (
                  <>
                    <span className="h-2.5 w-2.5 border-t border-muted-foreground rounded-full animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Suggest Title
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
              className="w-full bg-transparent border-none outline-none font-heading font-bold text-3xl md:text-4xl tracking-tight text-foreground placeholder:text-muted-foreground/25 py-1 transition-colors"
            />
          </div>

          {suggestedTitle && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 flex items-center flex-wrap gap-2 px-3 py-1.5 rounded-lg border bg-zinc-50/50 dark:bg-zinc-900/30 border-border/30 w-fit shadow-sm -mt-2">
              <span className="text-[10.5px] font-sans text-muted-foreground font-medium select-none">AI Concept:</span>
              <span className="text-[12px] font-semibold font-sans text-zinc-800 dark:text-zinc-200">"{suggestedTitle}"</span>
              
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border/40 h-4">
                <button
                  onClick={handleApplyTitle}
                  className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-sans font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  Apply
                </button>
                <button
                  onClick={handleSuggestTitle}
                  disabled={isSuggestingTitle}
                  className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
                  title="Regenerate suggestion"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setSuggestedTitle(null)}
                  className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Dismiss suggestion"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-x-6 gap-y-3 pb-4 pt-1 border-b border-border/10">
            
            <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground select-none">
              <Layers className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span>Category:</span>
              
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-foreground border border-border/40 font-medium cursor-pointer transition-colors select-none text-zinc-700 dark:text-zinc-300 text-[11px] active:scale-[0.97]">
                    {note.category ? note.category.name : "Uncategorized"}
                    <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <DropdownMenuItem 
                        key={c._id} 
                        onClick={() => handleCategorySelect(c._id)}
                        className={cn(
                          "cursor-pointer text-xs py-1.5 capitalize", 
                          note.category?._id === c._id && "bg-primary/10 text-primary font-semibold"
                        )}
                      >
                        {c.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2.5 py-2 text-[10.5px] text-muted-foreground italic">No categories established.</div>
                  )}
                  
                  {note.category && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleCategorySelect(null)}
                        className="cursor-pointer text-xs text-destructive hover:bg-destructive/5 py-1.5"
                      >
                        Clear Category
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {isAddingCategory ? (
                <div className="relative flex items-center animate-in fade-in slide-in-from-left-1 duration-150 ml-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="category label..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onBlur={() => { if(!newCatName.trim()) setIsAddingCategory(false); }}
                    onKeyDown={handleCategorySubmit}
                    disabled={isCatLoading}
                    className="h-[22px] text-[10.5px] font-sans border rounded px-2 focus:w-32 w-20 transition-all outline-none border-primary/40 bg-background placeholder:text-muted-foreground/40"
                  />
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="text-[10.5px] font-sans px-1 py-0.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded ml-0.5"
                  title="Instantiate a new Category"
                >
                  + New
                </button>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-1.5 min-h-[24px]">
              <TagIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs font-sans text-muted-foreground mr-0.5">Tags:</span>

              {note.tags && note.tags.map((tag) => (
                <span 
                  key={tag._id}
                  className="group inline-flex items-center gap-1 text-[10px] font-sans font-medium pl-2 pr-1.5 py-0.5 rounded bg-primary/5 border border-primary/10 text-primary select-none capitalize shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:bg-primary/10 transition-colors"
                >
                  <span># {tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag._id)}
                    className="inline-flex items-center justify-center rounded-full hover:bg-primary/20 hover:text-primary text-primary/50 transition-colors p-0.5 -mr-0.5 cursor-pointer"
                    title={`Remove #${tag.name}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              
              {isAddingTag ? (
                <div className="flex items-center relative animate-in fade-in duration-150 ml-0.5">
                  <TagIcon className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/70" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="topic name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onBlur={() => {
                      if(!newTagName.trim()) setIsAddingTag(false);
                    }}
                    onKeyDown={handleTagSubmit}
                    disabled={isTagLoading}
                    className="h-[22px] text-[10.5px] font-sans border rounded pl-5 pr-2 w-24 focus:w-32 transition-all outline-none border-primary/40 bg-background placeholder:text-muted-foreground/40"
                  />
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center text-[10.5px] font-sans font-medium px-2 py-0.5 rounded border border-dashed border-border hover:border-foreground/40 text-muted-foreground/60 hover:text-foreground transition-all cursor-pointer select-none active:scale-95 ml-0.5"
                >
                  + Add Tag
                </button>
              )}
            </div>
          </div>

          {(isGeneratingSummary || summaryData) && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 p-4 rounded-xl border bg-zinc-50/40 dark:bg-zinc-900/20 border-border/40 flex flex-col gap-2.5 relative group mt-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-text">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-sans font-bold text-muted-foreground/70">
                  <Sparkles className="h-3 w-3 text-muted-foreground/60" />
                  <span>AI Summary</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {summaryData && !isGeneratingSummary && (
                    <>
                      <button
                        onClick={handleCopySummary}
                        className="h-5.5 w-5.5 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy summary text"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={handleGenerateSummary}
                        className="h-5.5 w-5.5 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Regenerate Summary"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isGeneratingSummary ? (
                <div className="flex flex-col gap-2 py-1 select-none">
                  <div className="h-3 bg-muted/60 animate-pulse rounded w-[95%]" />
                  <div className="h-3 bg-muted/60 animate-pulse rounded w-[70%]" />
                </div>
              ) : (
                <p className="text-[12.5px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans tracking-normal">
                  {summaryData?.summary}
                </p>
              )}
              
              {summaryData && !isGeneratingSummary && (
                <div className="text-[9.5px] text-muted-foreground/40 select-none font-sans self-end italic">
                  Generated {new Date(summaryData.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          )}

          {(isExtractingTasks || (extractedTasks && extractedTasks.length > 0)) && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 p-4 rounded-xl border bg-zinc-50/30 dark:bg-zinc-900/10 border-border/30 flex flex-col gap-2.5 relative group shadow-[0_1px_2px_rgba(0,0,0,0.01)] select-text mt-1">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-sans font-bold text-muted-foreground/70">
                  <ListTodo className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span>Action Items</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {extractedTasks && extractedTasks.length > 0 && !isExtractingTasks && (
                    <>
                      <button
                        onClick={handleCopyTasks}
                        className="h-5.5 w-5.5 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy tasks to clipboard (as Markdown checklist)"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={handleExtractTasks}
                        className="h-5.5 w-5.5 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Regenerate Tasks"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExtractingTasks ? (
                <div className="flex flex-col gap-2.5 py-1 select-none">
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="h-3.5 w-3.5 bg-muted/60 rounded flex-shrink-0" />
                    <div className="h-3 bg-muted/60 rounded w-[85%]" />
                  </div>
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="h-3.5 w-3.5 bg-muted/60 rounded flex-shrink-0" />
                    <div className="h-3 bg-muted/60 rounded w-[60%]" />
                  </div>
                </div>
              ) : (
                <ul className="flex flex-col gap-2.5 mt-0.5">
                  {extractedTasks?.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[12.5px] font-sans text-zinc-700 dark:text-zinc-300 tracking-normal leading-tight">
                      <div className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-transparent flex items-center justify-center select-none" />
                      <span className="pt-[1px]">{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start capturing your thoughts..."
            className="w-full min-h-[300px] bg-transparent border-none outline-none resize-none font-sans text-[15px] md:text-[16px] leading-[1.75] tracking-normal text-zinc-800 dark:text-zinc-200 placeholder:text-muted-foreground/30 p-0 py-1 transition-all select-text placeholder:italic"
            style={{ height: "auto" }}
          />
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pt-2 px-1">
            <DialogTitle className="font-heading font-semibold tracking-tight text-red-600 dark:text-red-400 text-lg flex items-center gap-2">
              <Trash2 className="size-4.5" />
              Permanently delete note?
            </DialogTitle>
            <DialogDescription className="font-sans text-[13px] pt-1 leading-relaxed">
              This action is irreversible. Clicking delete will permanently erase <span className="font-semibold text-foreground">"{title || "Untitled Note"}"</span> from your workspace backups and database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t pt-4 flex gap-2 justify-end">
            <DialogClose>
              <Button 
                variant="ghost" 
                className="font-sans text-xs border hover:bg-muted/30"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="font-sans text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 active:scale-98 shadow-xs"
            >
              <Trash2 className="size-3.5" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareModal
        isOpen={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        noteId={note._id}
      />
    </div>
  );
}
