"use client";

import React, { useEffect, useState } from "react";
import { FileText, Archive, Sparkles, ArrowLeft, Loader2, RefreshCcw, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalNotes: number;
  archivedNotes: number;
  topTags: { tag: string; count: number }[];
  recentActivity: { _id: string; title: string; updatedAt: string }[];
  aiUsage: {
    total: number;
    breakdown: { type: string; count: number }[];
  };
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/analytics");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load metrics");
      }
    } catch (e) {
      setError("Unable to connect to the analytics service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-sm">
          <p className="text-[11px] font-sans font-medium text-foreground capitalize mb-1">{label}</p>
          <p className="text-[10.5px] font-sans text-muted-foreground">
            <span className="font-semibold text-primary">{payload[0].value}</span> notes
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50/50 dark:bg-[#0c0c0d] items-center justify-center animate-in fade-in duration-300">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40 mb-4" />
        <p className="text-xs font-sans text-muted-foreground">Compiling workspace metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50/50 dark:bg-[#0c0c0d] items-center justify-center px-6 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <RefreshCcw className="h-5 w-5 text-destructive/70" />
        </div>
        <h2 className="text-lg font-heading font-medium text-foreground mb-1">Failed to load metrics</h2>
        <p className="text-xs font-sans text-muted-foreground max-w-sm mb-6">{error}</p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            Return to Notes
          </Button>
          <Button size="sm" onClick={fetchAnalytics}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 dark:bg-[#0c0c0d] overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/40"
              title="Back to workspace"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-heading font-semibold text-foreground tracking-tight">
                Workspace Overview
              </h1>
              <p className="text-[11.5px] font-sans text-muted-foreground">
                A high-level look at your productivity metrics.
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="h-8 px-3 text-xs text-muted-foreground hover:bg-muted/50 hidden md:flex"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCcw className="h-3.5 w-3.5 mr-1.5 opacity-70" />}
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium font-sans uppercase tracking-wider">Active Notes</span>
            </div>
            <span className="text-3xl font-heading font-bold text-foreground tracking-tight">
              {data?.totalNotes || 0}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Archive className="h-4 w-4" />
              <span className="text-xs font-medium font-sans uppercase tracking-wider">Archived Notes</span>
            </div>
            <span className="text-3xl font-heading font-bold text-foreground tracking-tight">
              {data?.archivedNotes || 0}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium font-sans uppercase tracking-wider">AI Operations</span>
            </div>
            <span className="text-3xl font-heading font-bold text-foreground tracking-tight">
              {data?.aiUsage.total || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-6 rounded-xl border border-border/40 bg-background/50 p-6 shadow-sm">
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-foreground font-sans tracking-tight">Tag Distribution</h2>
              <p className="text-[11px] text-muted-foreground">Your most frequently used workspace tags.</p>
            </div>
            
            <div className="h-[240px] w-full mt-2">
              {data?.topTags && data.topTags.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topTags} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <XAxis 
                      dataKey="tag" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} 
                      dy={10}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} 
                      allowDecimals={false}
                    />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                      {data.topTags.map((entry, index) => (
                        <Cell key={`cell-${index}`} className="fill-primary/70 hover:fill-primary/90 transition-colors duration-300" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border/40 rounded-lg">
                   <Hash className="h-5 w-5 text-muted-foreground/30" />
                   <span className="text-[11.5px] font-medium text-muted-foreground/60">No tags used yet</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6 rounded-xl border border-border/40 bg-background/50 p-6 shadow-sm">
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-foreground font-sans tracking-tight">Recent Activity</h2>
              <p className="text-[11px] text-muted-foreground">Notes you have recently updated.</p>
            </div>

            <div className="flex flex-col gap-1">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((note) => (
                  <button
                    key={note._id}
                    onClick={() => router.push(`/dashboard?noteId=${note._id}`)}
                    className="group flex flex-col items-start gap-1 p-3 rounded-lg hover:bg-muted/40 transition-colors text-left border border-transparent hover:border-border/30"
                  >
                    <span className="text-[13px] font-medium text-foreground truncate w-full group-hover:text-primary transition-colors">
                      {note.title || "Untitled Note"}
                    </span>
                    <span className="text-[10.5px] font-sans text-muted-foreground/80">
                      Modified {new Date(note.updatedAt).toLocaleDateString("en-US", { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </button>
                ))
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border/40 rounded-lg">
                   <FileText className="h-5 w-5 text-muted-foreground/30" />
                   <span className="text-[11.5px] font-medium text-muted-foreground/60">No recent notes</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
