"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Compass, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-12 select-none overflow-hidden bg-background">
      <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col justify-between overflow-hidden bg-zinc-50 dark:bg-zinc-900/30 border-r border-border/50 p-10 xl:p-12">
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px"
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
            <div className="relative h-16 w-16">
              <Image
                src="/peblo-logo.png"
                alt="Peblo Notes"
                fill
                className="object-contain scale-300 translate-x-4"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="relative z-10 py-10">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <h1 className="font-heading text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
                Capture context, <br />
                uncover connections.
              </h1>
              <p className="font-sans text-sm xl:text-base text-muted-foreground leading-relaxed max-w-[320px]">
                Peblo connects your ideas dynamically, building a calm workspace tailored for real learning.
              </p>
            </div>
          </div>

          <div className="mt-12 relative flex aspect-[4/3] w-full max-w-[340px] rounded-2xl border border-border/70 bg-background/80 backdrop-blur-md p-4 shadow-sm dark:shadow-none ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
            <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border bg-card px-3 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-sans font-medium text-foreground">Research Node</span>
            </div>
            
            <div className="absolute top-16 right-8 flex items-center gap-2 rounded-full border bg-card px-3 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-sans font-medium text-foreground">Action Items</span>
            </div>
            
            <div className="absolute bottom-10 left-1/4 flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 shadow-sm">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-sans font-semibold text-primary">AI Synthesis</span>
            </div>

            <svg className="absolute inset-0 h-full w-full text-muted/30 pointer-events-none -z-10" fill="none">
              <path d="M 100 40 C 120 60, 180 60, 220 70" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 230 90 C 200 120, 160 150, 110 165" stroke="currentColor" strokeWidth="1" />
              <path d="M 90 45 C 70 80, 60 130, 90 160" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            <div className="mt-auto w-full grid gap-2">
              <div className="h-2.5 w-3/4 rounded-full bg-muted/50" />
              <div className="h-2.5 w-1/2 rounded-full bg-muted/30" />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <Compass className="h-3.5 w-3.5" />
            <span>AI-Assisted Universe</span>
          </div>
          <div className="h-3 w-px bg-border/80" />
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Focus First</span>
          </div>
        </div>
      </div>

      <main className="lg:col-span-7 xl:col-span-8 flex flex-col px-6 md:px-12 lg:px-16 xl:px-24 py-10 justify-center">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative h-16 w-48">
              <Image
                src="/peblo-logo.png"
                alt="Peblo Notes"
                fill
                className="object-contain invert-0 dark:invert"
                priority
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
