import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "primary" | "muted"
  fullPage?: boolean
  label?: string
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
  xl: "h-16 w-16 border-4",
}

export function Loader({
  className,
  size = "md",
  variant = "primary",
  fullPage = false,
  label,
  ...props
}: LoaderProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={cn(
          "animate-spin",
          {
            "text-primary": variant === "primary",
            "text-foreground": variant === "default",
            "text-muted-foreground": variant === "muted",
            "size-4": size === "sm",
            "size-6": size === "md",
            "size-10": size === "lg",
            "size-16": size === "xl",
          }
        )}
      />
      {label && (
        <p className={cn("text-sm font-sans select-none animate-pulse", {
          "text-muted-foreground": variant === "muted" || variant === "primary",
          "text-foreground": variant === "default"
        })}>
          {label}
        </p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200",
          className
        )}
        {...props}
      >
        {spinner}
      </div>
    )
  }

  return (
    <div
      className={cn("flex items-center justify-center p-4", className)}
      {...props}
    >
      {spinner}
    </div>
  )
}
