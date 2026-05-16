import * as React from "react";
import { Copy, Globe, Lock, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
}

export function ShareModal({ isOpen, onOpenChange, noteId }: ShareModalProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isToggling, setIsToggling] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState(false);
  const [shareId, setShareId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const fetchStatus = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/notes/${noteId}/share`);
          const data = await res.json();
          if (data.success && data.sharedNote) {
            setIsPublic(data.sharedNote.isPublic);
            setShareId(data.sharedNote.shareId);
          }
        } catch (e) {
          toast.error("Failed to load share settings.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchStatus();
    } else {
      setCopied(false);
    }
  }, [isOpen, noteId]);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (!shareId) {
        const res = await fetch(`/api/notes/${noteId}/share`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setIsPublic(data.sharedNote.isPublic);
          setShareId(data.sharedNote.shareId);
        }
      } else {
        const res = await fetch(`/api/notes/${noteId}/share`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: !isPublic }),
        });
        const data = await res.json();
        if (data.success) {
          setIsPublic(data.sharedNote.isPublic);
        }
      }
    } catch (e) {
      toast.error("Failed to update share settings.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopy = () => {
    if (!shareId) return;
    const url = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 gap-6 outline-none">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-heading tracking-tight">Share to web</DialogTitle>
          <DialogDescription className="text-xs font-sans text-muted-foreground">
            Publish this note to the web. Anyone with the link will be able to read it.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center h-9 w-9 rounded-full ${isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium font-sans">
                    {isPublic ? "Publicly accessible" : "Private"}
                  </span>
                  <span className="text-[11px] font-sans text-muted-foreground">
                    {isPublic ? "Anyone with the link can view" : "Only you can access this note"}
                  </span>
                </div>
              </div>

              <Button
                variant={isPublic ? "destructive" : "default"}
                size="sm"
                className="h-8 text-xs font-sans"
                onClick={handleToggle}
                disabled={isToggling}
              >
                {isToggling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isPublic ? (
                  "Unpublish"
                ) : (
                  "Publish"
                )}
              </Button>
            </div>

            {isPublic && shareId && (
              <div className="flex flex-col gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <span className="text-xs font-medium font-sans text-foreground">Share Link</span>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/shared/${shareId}`}
                    className="flex-1 min-w-0 h-9 rounded-md bg-muted/30 border border-border/40 px-3 text-xs font-mono text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    variant="outline"
                    className="h-9 w-9 p-0 shrink-0 border-border/40 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
