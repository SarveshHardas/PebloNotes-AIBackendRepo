import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    props?: ButtonProps
  }
}

export function EmptyState({
  className,
  icon: Icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center animate-in fade-in-50 duration-300",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 border">
        {Icon ? (
          <Icon className="h-8 w-8 text-muted-foreground" />
        ) : (
          <span className="text-2xl">📂</span>
        )}
      </div>
      
      <h3 className="mt-4 text-lg font-semibold font-subheading tracking-tight text-foreground">
        {title}
      </h3>
      
      <p className="mt-2 max-w-sm text-sm text-muted-foreground font-sans">
        {description}
      </p>
      
      {action && (
        <div className="mt-6">
          <Button
            onClick={action.onClick}
            className="shadow-sm font-sans"
            {...action.props}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
