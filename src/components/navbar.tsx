"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NavItem {
  label: string
  href: string
}

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logoSrc?: string
  logoAlt?: string
  navItems?: NavItem[]
  showAuthButtons?: boolean
}

export function Navbar({
  className,
  logoSrc = "/peblo-logo.png",
  logoAlt = "Peblo Notes",
  navItems = [
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Docs", href: "#" },
  ],
  showAuthButtons = true,
  ...props
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="relative h-8 w-32 sm:w-36">
            <Image
              src={logoSrc}
              alt={logoAlt}
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-sans text-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {showAuthButtons && (
            <div className="hidden sm:flex items-center gap-2 font-sans">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign In
              </Button>
              <Button size="sm" className="text-xs shadow-sm font-medium">
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-in slide-in-from-top-2 duration-200 bg-background border-b absolute top-16 w-full left-0 px-4 py-6 flex flex-col gap-4 z-40">
          <nav className="flex flex-col gap-3 font-sans">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-base font-medium text-muted-foreground hover:text-foreground py-1 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {showAuthButtons && (
            <div className="flex flex-col gap-2 pt-2 border-t font-sans">
              <Button variant="outline" className="w-full font-medium" onClick={() => setIsOpen(false)}>
                Sign In
              </Button>
              <Button className="w-full shadow-sm font-medium" onClick={() => setIsOpen(false)}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
