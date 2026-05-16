import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  Edit3,
  Layers,
  Lock,
  Moon,
  Sparkles,
  Zap
} from "lucide-react";
import Image from "next/image";
import { StandaloneThemeToggle } from "@/components/standalone-theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 lg:px-10 h-16 flex items-center border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Image src="/peblo-logo.png" alt="Peblo Notes" width={200} height={200} className="rounded-lg" />
        </div>

        <nav className="ml-auto flex items-center gap-4 md:gap-6 font-sans">
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block">
            Features
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block">
            Pricing
          </Link>
          <Link href="/login">
            <Button size="sm" variant="ghost" className="font-sans">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="font-sans shadow-sm">
              Get Started
            </Button>
          </Link>
          <StandaloneThemeToggle />
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center w-full relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.1]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(to bottom, black 10%, transparent 60%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 10%, transparent 60%)"
          }}
        />
        <section className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading text-foreground text-balance leading-tight mb-6">
            Where ideas find a <span className="text-primary">beautiful</span> home.
          </h1>

          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-sans font-light text-balance mb-8">
            Peblo is a minimal, fast, and slightly playful workspace built for thinkers, creators, and builders. Organize your life, one note at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full font-sans text-base h-12 px-8 rounded-xl shadow-sm">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href={"/login"}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-sans text-base h-12 px-8 rounded-xl">
                Already signed up? Log In
              </Button>
            </Link>
          </div>
        </section>

        <section className="w-full max-w-5xl mx-auto px-6 pb-24">
          <div className="relative rounded-2xl border border-border/60 bg-muted/20 p-2 shadow-2xl shadow-primary/5">
            <div className="rounded-xl border border-border/40 overflow-hidden bg-background aspect-[16/9] flex flex-col shadow-sm">
              <div className="h-10 border-b bg-muted/40 flex items-center px-4 gap-1.5">
                <div className="size-3 rounded-full bg-red-400/60" />
                <div className="size-3 rounded-full bg-amber-400/60" />
                <div className="size-3 rounded-full bg-emerald-400/60" />
                <div className="mx-auto bg-muted/70 text-[10px] px-3 py-1 rounded-md text-muted-foreground font-sans border min-w-[200px] text-center">
                  app.peblo.so/workspace
                </div>
              </div>

              <div className="flex flex-1">
                <div className="w-44 border-r bg-muted/10 p-3 hidden sm:flex flex-col gap-4 font-sans text-xs">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="flex flex-col gap-2">
                    <div className="h-7 bg-muted/60 rounded flex items-center px-2 gap-2"><div className="size-3 rounded-full bg-blue-500/20" /> Note A</div>
                    <div className="h-7 rounded flex items-center px-2 gap-2 text-muted-foreground"><div className="size-3 rounded-full bg-amber-500/20" /> Note B</div>
                    <div className="h-7 rounded flex items-center px-2 gap-2 text-muted-foreground"><div className="size-3 rounded-full bg-emerald-500/20" /> Note C</div>
                  </div>
                </div>
                <div className="flex-1 p-6 md:p-10 text-left space-y-4">
                  <h2 className="text-3xl font-heading font-bold text-muted-foreground/30">My First Note ✨</h2>
                  <div className="space-y-3 pt-2 opacity-40">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-5/6 bg-muted rounded" />
                    <div className="h-4 w-4/6 bg-muted rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-muted/30 border-y py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-6 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Zap className="size-5" />
              </div>
              <h3 className="text-lg font-bold font-subheading">Blazing Fast</h3>
              <p className="text-sm text-muted-foreground font-sans">Built for speed with Next.js App Router. Instant load states and fluid interactions.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Edit3 className="size-5" />
              </div>
              <h3 className="text-lg font-bold font-subheading">Markdown Supported</h3>
              <p className="text-sm text-muted-foreground font-sans">Intuitive shortcuts and rich formatting, heavily inspired by Linear and Notion ecosystems.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Lock className="size-5" />
              </div>
              <h3 className="text-lg font-bold font-subheading">Privacy First</h3>
              <p className="text-sm text-muted-foreground font-sans">Your notes are encrypted and securely stored. You maintain full ownership of your ideas.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 text-center font-sans text-sm text-muted-foreground bg-background">
        <p>© {new Date().getFullYear()} Peblo Notes. Handcrafted for better workflows.</p>
      </footer>
    </div>
  )
}
